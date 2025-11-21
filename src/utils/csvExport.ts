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
 * Pad string to fixed width
 */
function padString(
  str: string,
  width: number,
  align: 'left' | 'right' = 'left',
): string {
  const cleanStr = str.replace(/"/g, '');
  if (align === 'right') {
    return cleanStr.padStart(width, ' ');
  }
  return cleanStr.padEnd(width, ' ');
}

/**
 * Format number with thousand separators
 */
function formatNumber(num: number): string {
  return num.toLocaleString('vi-VN');
}

/**
 * Convert transactions to beautifully formatted CSV
 */
function transactionsToCSV(transactions: Transaction[]): string {
  // Define column widths
  const COL_DATE = 14;
  const COL_TYPE = 10;
  const COL_CATEGORY = 22;
  const COL_AMOUNT = 20;
  const COL_NOTE = 35;

  const totalWidth =
    COL_DATE + COL_TYPE + COL_CATEGORY + COL_AMOUNT + COL_NOTE + 16;

  // Create beautiful box drawing
  const topBorder = '╭' + '─'.repeat(totalWidth - 2) + '╮';
  const bottomBorder = '╰' + '─'.repeat(totalWidth - 2) + '╯';
  const divider = '├' + '─'.repeat(totalWidth - 2) + '┤';
  const thickDivider = '╞' + '═'.repeat(totalWidth - 2) + '╡';

  // Title
  const title = 'BÁO CÁO CHI TIÊU CHI TIẾT';
  const titlePadding = Math.floor((totalWidth - title.length - 2) / 2);
  let csv = topBorder + '\n';
  csv +=
    '│' +
    ' '.repeat(titlePadding) +
    title +
    ' '.repeat(totalWidth - titlePadding - title.length - 2) +
    '│\n';
  csv += '│' + ' '.repeat(totalWidth - 2) + '│\n';

  // Date info
  const dateInfo = `Ngày tạo: ${new Date().toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })}`;
  const datePadding = Math.floor((totalWidth - dateInfo.length - 2) / 2);
  csv +=
    '│' +
    ' '.repeat(datePadding) +
    dateInfo +
    ' '.repeat(totalWidth - datePadding - dateInfo.length - 2) +
    '│\n';
  csv += thickDivider + '\n';

  // Header
  csv +=
    '│ ' +
    padString('NGÀY', COL_DATE) +
    ' │ ' +
    padString('LOẠI', COL_TYPE) +
    ' │ ' +
    padString('DANH MỤC', COL_CATEGORY) +
    ' │ ' +
    padString('SỐ TIỀN (VNĐ)', COL_AMOUNT, 'right') +
    ' │ ' +
    padString('GHI CHÚ', COL_NOTE) +
    ' │\n';
  csv += divider + '\n';

  // Group transactions
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  // Format row function
  const formatRow = (tx: Transaction) => {
    const date = new Date(tx.date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const type = tx.type === 'income' ? '▲ Thu' : '▼ Chi';
    const category =
      CATEGORY_LIST.find(c => c.id === tx.category)?.label || tx.category;
    const amount = formatNumber(tx.amount);
    const note =
      (tx.note || '').slice(0, COL_NOTE - 3) +
      ((tx.note?.length || 0) > COL_NOTE - 3 ? '...' : '');

    return (
      '│ ' +
      padString(date, COL_DATE) +
      ' │ ' +
      padString(type, COL_TYPE) +
      ' │ ' +
      padString(category, COL_CATEGORY) +
      ' │ ' +
      padString(amount, COL_AMOUNT, 'right') +
      ' │ ' +
      padString(note, COL_NOTE) +
      ' │'
    );
  };

  // Income section
  if (incomeTransactions.length > 0) {
    const sectionTitle = `┤ THU NHẬP (${incomeTransactions.length} giao dịch) ├`;
    const sectionPadding = Math.floor(
      (totalWidth - sectionTitle.length - 2) / 2,
    );
    csv +=
      '├' +
      '─'.repeat(sectionPadding) +
      sectionTitle +
      '─'.repeat(totalWidth - sectionPadding - sectionTitle.length - 2) +
      '┤\n';

    incomeTransactions.forEach(tx => {
      csv += formatRow(tx) + '\n';
    });

    const totalIncome = incomeTransactions.reduce(
      (sum, t) => sum + t.amount,
      0,
    );
    csv += divider + '\n';
    csv +=
      '│ ' +
      padString('', COL_DATE + COL_TYPE + COL_CATEGORY + 8, 'right') +
      padString('TỔNG THU:', 12) +
      ' ' +
      padString(formatNumber(totalIncome), COL_AMOUNT, 'right') +
      '   ' +
      padString('', COL_NOTE) +
      ' │\n';
  }

  // Expense section
  if (expenseTransactions.length > 0) {
    const sectionTitle = `┤ CHI TIÊU (${expenseTransactions.length} giao dịch) ├`;
    const sectionPadding = Math.floor(
      (totalWidth - sectionTitle.length - 2) / 2,
    );
    csv +=
      '├' +
      '─'.repeat(sectionPadding) +
      sectionTitle +
      '─'.repeat(totalWidth - sectionPadding - sectionTitle.length - 2) +
      '┤\n';

    expenseTransactions.forEach(tx => {
      csv += formatRow(tx) + '\n';
    });

    const totalExpense = expenseTransactions.reduce(
      (sum, t) => sum + t.amount,
      0,
    );
    csv += divider + '\n';
    csv +=
      '│ ' +
      padString('', COL_DATE + COL_TYPE + COL_CATEGORY + 8, 'right') +
      padString('TỔNG CHI:', 12) +
      ' ' +
      padString(formatNumber(totalExpense), COL_AMOUNT, 'right') +
      '   ' +
      padString('', COL_NOTE) +
      ' │\n';
  }

  // Summary section
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseTransactions.reduce(
    (sum, t) => sum + t.amount,
    0,
  );
  const balance = totalIncome - totalExpense;

  csv += thickDivider + '\n';
  const summaryTitle = '┤ TỔNG KẾT ├';
  const summaryPadding = Math.floor((totalWidth - summaryTitle.length - 2) / 2);
  csv +=
    '├' +
    '─'.repeat(summaryPadding) +
    summaryTitle +
    '─'.repeat(totalWidth - summaryPadding - summaryTitle.length - 2) +
    '┤\n';

  csv += '│' + ' '.repeat(totalWidth - 2) + '│\n';
  csv +=
    '│  ' +
    padString('◆ Tổng thu nhập:', 35) +
    padString(formatNumber(totalIncome) + ' VNĐ', totalWidth - 39, 'right') +
    '  │\n';
  csv +=
    '│  ' +
    padString('◆ Tổng chi tiêu:', 35) +
    padString(formatNumber(totalExpense) + ' VNĐ', totalWidth - 39, 'right') +
    '  │\n';
  csv += '│  ' + padString('', totalWidth - 4) + '  │\n';
  csv +=
    '│  ' +
    padString('◆ Số dư:', 35, 'right') +
    padString(formatNumber(balance) + ' VNĐ', totalWidth - 39, 'right') +
    '  │\n';
  csv += '│' + ' '.repeat(totalWidth - 2) + '│\n';
  csv +=
    '│  ' +
    padString(`Tổng số giao dịch: ${transactions.length}`, totalWidth - 4) +
    '  │\n';
  csv += bottomBorder + '\n';

  return csv;
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
    const summary: Record<
      string,
      { income: number; expense: number; count: number }
    > = {};

    transactions.forEach(tx => {
      const categoryLabel =
        CATEGORY_LIST.find(c => c.id === tx.category)?.label || tx.category;

      if (!summary[categoryLabel]) {
        summary[categoryLabel] = { income: 0, expense: 0, count: 0 };
      }

      summary[categoryLabel].count++;
      if (tx.type === 'income') {
        summary[categoryLabel].income += tx.amount;
      } else {
        summary[categoryLabel].expense += tx.amount;
      }
    });

    // Define column widths
    const COL_CATEGORY = 24;
    const COL_COUNT = 10;
    const COL_INCOME = 20;
    const COL_EXPENSE = 20;
    const COL_DIFF = 20;
    const totalWidth =
      COL_CATEGORY + COL_COUNT + COL_INCOME + COL_EXPENSE + COL_DIFF + 16;

    // Create beautiful box
    const topBorder = '╭' + '─'.repeat(totalWidth - 2) + '╮';
    const bottomBorder = '╰' + '─'.repeat(totalWidth - 2) + '╯';
    const divider = '├' + '─'.repeat(totalWidth - 2) + '┤';
    const thickDivider = '╞' + '═'.repeat(totalWidth - 2) + '╡';

    // Title
    const title = 'BÁO CÁO TỔNG HỢP THEO DANH MỤC';
    const titlePadding = Math.floor((totalWidth - title.length - 2) / 2);
    let csv = topBorder + '\n';
    csv +=
      '│' +
      ' '.repeat(titlePadding) +
      title +
      ' '.repeat(totalWidth - titlePadding - title.length - 2) +
      '│\n';
    csv += '│' + ' '.repeat(totalWidth - 2) + '│\n';

    // Date info
    const dateInfo = `Ngày tạo: ${new Date().toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })}`;
    const datePadding = Math.floor((totalWidth - dateInfo.length - 2) / 2);
    csv +=
      '│' +
      ' '.repeat(datePadding) +
      dateInfo +
      ' '.repeat(totalWidth - datePadding - dateInfo.length - 2) +
      '│\n';
    csv += thickDivider + '\n';

    // Header
    csv +=
      '│ ' +
      padString('DANH MỤC', COL_CATEGORY) +
      ' │ ' +
      padString('SỐ GD', COL_COUNT, 'right') +
      ' │ ' +
      padString('THU (VNĐ)', COL_INCOME, 'right') +
      ' │ ' +
      padString('CHI (VNĐ)', COL_EXPENSE, 'right') +
      ' │ ' +
      padString('CHÊnh LỆCH (VNĐ)', COL_DIFF, 'right') +
      ' │\n';
    csv += divider + '\n';

    // Rows sorted by total amount
    const sortedCategories = Object.entries(summary).sort((a, b) => {
      const totalA = a[1].income + a[1].expense;
      const totalB = b[1].income + b[1].expense;
      return totalB - totalA;
    });

    sortedCategories.forEach(([category, amounts]) => {
      const diff = amounts.income - amounts.expense;
      const diffSign = diff > 0 ? '+' : diff < 0 ? '-' : ' ';
      csv +=
        '│ ' +
        padString(category, COL_CATEGORY) +
        ' │ ' +
        padString(amounts.count.toString(), COL_COUNT, 'right') +
        ' │ ' +
        padString(formatNumber(amounts.income), COL_INCOME, 'right') +
        ' │ ' +
        padString(formatNumber(amounts.expense), COL_EXPENSE, 'right') +
        ' │ ' +
        padString(
          diffSign + ' ' + formatNumber(Math.abs(diff)),
          COL_DIFF,
          'right',
        ) +
        ' │\n';
    });

    // Add totals
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpense;
    const totalCount = transactions.length;

    csv += thickDivider + '\n';
    csv +=
      '│ ' +
      padString('TỔNG CỘNG', COL_CATEGORY) +
      ' │ ' +
      padString(totalCount.toString(), COL_COUNT, 'right') +
      ' │ ' +
      padString(formatNumber(totalIncome), COL_INCOME, 'right') +
      ' │ ' +
      padString(formatNumber(totalExpense), COL_EXPENSE, 'right') +
      ' │ ' +
      padString(
        (netBalance >= 0 ? '+ ' : '- ') + formatNumber(Math.abs(netBalance)),
        COL_DIFF,
        'right',
      ) +
      ' │\n';
    csv += thickDivider + '\n';

    // Statistics section
    const statsTitle = '┤ THỐNG KÊ ├';
    const statsPadding = Math.floor((totalWidth - statsTitle.length - 2) / 2);
    csv +=
      '├' +
      '─'.repeat(statsPadding) +
      statsTitle +
      '─'.repeat(totalWidth - statsPadding - statsTitle.length - 2) +
      '┤\n';
    csv += '│' + ' '.repeat(totalWidth - 2) + '│\n';

    const incomeCount = transactions.filter(t => t.type === 'income').length;
    const expenseCount = transactions.filter(t => t.type === 'expense').length;
    const avgIncome = incomeCount > 0 ? totalIncome / incomeCount : 0;
    const avgExpense = expenseCount > 0 ? totalExpense / expenseCount : 0;

    csv +=
      '│  ◆ Số danh mục: ' +
      padString(
        Object.keys(summary).length.toString(),
        totalWidth - 21,
        'right',
      ) +
      '  │\n';
    csv +=
      '│  ◆ Tổng giao dịch: ' +
      padString(totalCount.toString(), totalWidth - 24, 'right') +
      '  │\n';
    csv +=
      '│    • Giao dịch thu: ' +
      padString(incomeCount.toString(), totalWidth - 26, 'right') +
      '  │\n';
    csv +=
      '│    • Giao dịch chi: ' +
      padString(expenseCount.toString(), totalWidth - 26, 'right') +
      '  │\n';
    csv += '│' + ' '.repeat(totalWidth - 2) + '│\n';
    csv +=
      '│  ◆ Trung bình thu/GD: ' +
      padString(
        formatNumber(Math.round(avgIncome)) + ' VNĐ',
        totalWidth - 29,
        'right',
      ) +
      '  │\n';
    csv +=
      '│  ◆ Trung bình chi/GD: ' +
      padString(
        formatNumber(Math.round(avgExpense)) + ' VNĐ',
        totalWidth - 29,
        'right',
      ) +
      '  │\n';
    csv += '│' + ' '.repeat(totalWidth - 2) + '│\n';
    csv += bottomBorder + '\n';

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
