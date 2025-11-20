import * as RNFS from '@dr.pogodin/react-native-fs';
import Share from 'react-native-share';
import { Platform, PermissionsAndroid } from 'react-native';
import type { Transaction } from '@/types/transaction';
import { CATEGORY_LIST } from '@/constants/categories';
import { formatCurrency } from './format';

/**
 * Request storage permission on Android
 */
async function requestStoragePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    if (Platform.Version >= 33) {
      return true;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Quyền lưu file',
        message: 'Ứng dụng cần quyền lưu file để xuất CSV',
        buttonNeutral: 'Hỏi lại sau',
        buttonNegative: 'Huỷ',
        buttonPositive: 'Đồng ý',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Permission error:', err);
    return false;
  }
}

/**
 * Get safe path helpers
 */
const getDocumentPath = () => {
  return RNFS.DocumentDirectoryPath || '/storage/emulated/0/Documents';
};

const getDownloadPath = () => {
  return RNFS.DownloadDirectoryPath || '/storage/emulated/0/Download';
};

/**
 * Convert transactions to CSV format
 */
function transactionsToCSV(transactions: Transaction[]): string {
  // CSV Header
  const header = 'Ngày,Loại,Danh mục,Số tiền,Ghi chú\n';

  // CSV Rows
  const rows = transactions
    .map(tx => {
      const date = new Date(tx.date).toLocaleDateString('vi-VN');
      const type = tx.type === 'income' ? 'Thu' : 'Chi';
      const category =
        CATEGORY_LIST.find(c => c.id === tx.category)?.label || tx.category;
      const amount = tx.amount.toString();
      const note = (tx.note || '').replace(/"/g, '""'); // Escape quotes

      return `"${date}","${type}","${category}","${amount}","${note}"`;
    })
    .join('\n');

  return header + rows;
}

/**
 * Export transactions to CSV file
 */
export async function exportCSV(
  transactions: Transaction[],
): Promise<{ success: boolean; message: string; filePath?: string }> {
  try {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      return {
        success: false,
        message: 'Cần cấp quyền lưu file để xuất CSV',
      };
    }

    // Convert to CSV
    const csvContent = transactionsToCSV(transactions);

    // Add BOM for Excel UTF-8 support
    const bom = '\uFEFF';
    const csvWithBom = bom + csvContent;

    // Create file path
    const timestamp = new Date().getTime();
    const fileName = `SoChiTieu_Report_${timestamp}.csv`;
    const filePath =
      Platform.OS === 'ios'
        ? `${getDocumentPath()}/${fileName}`
        : `${getDownloadPath()}/${fileName}`;

    // Write CSV file
    await RNFS.writeFile(filePath, csvWithBom, 'utf8');

    return {
      success: true,
      message: `Đã xuất ${transactions.length} giao dịch ra file CSV`,
      filePath,
    };
  } catch (error) {
    console.error('CSV Export error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Lỗi khi xuất CSV',
    };
  }
}

/**
 * Share CSV file
 */
export async function shareCSVFile(filePath: string): Promise<void> {
  await Share.open({
    title: 'Chia sẻ báo cáo CSV',
    message: 'Báo cáo chi tiêu của bạn',
    url: Platform.OS === 'ios' ? filePath : `file://${filePath}`,
    type: 'text/csv',
    subject: 'Báo cáo Sổ Chi Tiêu',
  });
}

/**
 * Export and share CSV file (deprecated - use exportCSV then show modal)
 */
export async function exportAndShareCSV(
  transactions: Transaction[],
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await exportCSV(transactions);

    if (!result.success || !result.filePath) {
      return result;
    }

    // Share the file
    await Share.open({
      title: 'Chia sẻ báo cáo CSV',
      message: 'Báo cáo chi tiêu của bạn',
      url:
        Platform.OS === 'ios' ? result.filePath : `file://${result.filePath}`,
      type: 'text/csv',
      subject: 'Báo cáo Sổ Chi Tiêu',
    });

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    if ((error as any).message?.includes('User did not share')) {
      // User cancelled share
      return {
        success: true,
        message: 'File CSV đã được lưu',
      };
    }

    console.error('Share CSV error:', error);
    return {
      success: false,
      message: 'Không thể chia sẻ file CSV',
    };
  }
}

/**
 * Generate summary statistics CSV
 */
export async function exportSummaryCSV(
  transactions: Transaction[],
): Promise<{ success: boolean; message: string; filePath?: string }> {
  try {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      return {
        success: false,
        message: 'Cần cấp quyền lưu file để xuất CSV',
      };
    }

    // Calculate summary by category
    const summary: Record<string, { income: number; expense: number }> = {};

    transactions.forEach(tx => {
      const categoryLabel =
        CATEGORY_LIST.find(c => c.id === tx.category)?.label || tx.category;

      if (!summary[categoryLabel]) {
        summary[categoryLabel] = { income: 0, expense: 0 };
      }

      if (tx.type === 'income') {
        summary[categoryLabel].income += tx.amount;
      } else {
        summary[categoryLabel].expense += tx.amount;
      }
    });

    // Create CSV
    let csv = 'Danh mục,Thu nhập,Chi tiêu,Chênh lệch\n';

    Object.entries(summary).forEach(([category, amounts]) => {
      const diff = amounts.income - amounts.expense;
      csv += `"${category}","${formatCurrency(
        amounts.income,
      )}","${formatCurrency(amounts.expense)}","${formatCurrency(diff)}"\n`;
    });

    // Add totals
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpense;

    csv += '\n';
    csv += `"TỔNG CỘNG","${formatCurrency(totalIncome)}","${formatCurrency(
      totalExpense,
    )}","${formatCurrency(netBalance)}"\n`;

    // Add BOM
    const bom = '\uFEFF';
    const csvWithBom = bom + csv;

    // Save file
    const timestamp = new Date().getTime();
    const fileName = `SoChiTieu_Summary_${timestamp}.csv`;
    const filePath =
      Platform.OS === 'ios'
        ? `${getDocumentPath()}/${fileName}`
        : `${getDownloadPath()}/${fileName}`;

    await RNFS.writeFile(filePath, csvWithBom, 'utf8');

    return {
      success: true,
      message: 'Đã xuất báo cáo tổng hợp',
      filePath,
    };
  } catch (error) {
    console.error('Summary CSV error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Lỗi khi xuất báo cáo',
    };
  }
}
