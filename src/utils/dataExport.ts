import RNFS from '@dr.pogodin/react-native-fs';
import Share from 'react-native-share';
import { Platform, PermissionsAndroid } from 'react-native';
import { encryptData, decryptData } from './encryption';
import type { Transaction } from '@/types/transaction';

const FILE_NAME = 'SoChiTieu_Backup';
const FILE_EXTENSION = '.sct';

interface BackupData {
  version: string;
  exportDate: string;
  transactions: Transaction[];
  customCategories?: any[];
}

/**
 * Request storage permission on Android
 */
async function requestStoragePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    if (Platform.Version >= 33) {
      // Android 13+ doesn't need WRITE_EXTERNAL_STORAGE
      return true;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Quyền lưu file',
        message: 'Ứng dụng cần quyền lưu file để xuất dữ liệu',
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
 * Export transactions to encrypted file
 */
export async function exportData(
  transactions: Transaction[],
  customCategories?: any[],
): Promise<{ success: boolean; message: string; filePath?: string }> {
  try {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      return {
        success: false,
        message: 'Cần cấp quyền lưu file để xuất dữ liệu',
      };
    }

    // Prepare backup data
    const backupData: BackupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      transactions,
      customCategories,
    };

    // Convert to JSON and encrypt
    const jsonData = JSON.stringify(backupData);
    const encryptedData = encryptData(jsonData);

    // Create file path
    const timestamp = new Date().getTime();
    const fileName = `${FILE_NAME}_${timestamp}${FILE_EXTENSION}`;
    const filePath =
      Platform.OS === 'ios'
        ? `${RNFS.DocumentDirectoryPath}/${fileName}`
        : `${RNFS.DownloadDirectoryPath}/${fileName}`;

    // Write encrypted data to file
    await RNFS.writeFile(filePath, encryptedData, 'utf8');

    return {
      success: true,
      message: `Đã xuất ${transactions.length} giao dịch thành công`,
      filePath,
    };
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Lỗi khi xuất dữ liệu',
    };
  }
}

/**
 * Share exported file
 */
export async function shareExportedFile(filePath: string): Promise<void> {
  try {
    const shareOptions = {
      title: 'Chia sẻ dữ liệu Sổ Chi Tiêu',
      message: 'File sao lưu dữ liệu chi tiêu của bạn',
      url: Platform.OS === 'ios' ? filePath : `file://${filePath}`,
      type: 'application/octet-stream',
      subject: 'Sao lưu Sổ Chi Tiêu',
    };

    await Share.open(shareOptions);
  } catch (error) {
    // User cancelled share
    console.log('Share cancelled:', error);
  }
}

/**
 * Import data from encrypted file
 */
export async function importData(
  filePath: string,
): Promise<{ success: boolean; message: string; data?: BackupData }> {
  try {
    // Check if file exists
    const exists = await RNFS.exists(filePath);
    if (!exists) {
      return {
        success: false,
        message: 'File không tồn tại',
      };
    }

    // Read encrypted file
    const encryptedData = await RNFS.readFile(filePath, 'utf8');

    // Decrypt data
    const jsonData = decryptData(encryptedData);

    // Parse JSON
    const backupData: BackupData = JSON.parse(jsonData);

    // Validate data structure
    if (!backupData.version || !backupData.transactions) {
      return {
        success: false,
        message: 'File không đúng định dạng',
      };
    }

    return {
      success: true,
      message: `Đã nhập ${backupData.transactions.length} giao dịch thành công`,
      data: backupData,
    };
  } catch (error) {
    console.error('Import error:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Lỗi khi nhập dữ liệu. File có thể bị hỏng hoặc không đúng định dạng.',
    };
  }
}

/**
 * Get list of backup files in download directory
 */
export async function getBackupFiles(): Promise<string[]> {
  try {
    const downloadPath =
      Platform.OS === 'ios'
        ? RNFS.DocumentDirectoryPath
        : RNFS.DownloadDirectoryPath;

    const files = await RNFS.readDir(downloadPath);

    // Filter only .sct files
    const backupFiles = files
      .filter((file: any) => file.name.endsWith(FILE_EXTENSION))
      .map((file: any) => file.path)
      .sort((a: string, b: string) => b.localeCompare(a)); // Sort by name (newest first)

    return backupFiles;
  } catch (error) {
    console.error('Error listing backup files:', error);
    return [];
  }
}

/**
 * Pick a file for import from list of backup files
 */
export async function pickImportFile(): Promise<string | null> {
  // This will be called from UI with file picker
  // For now, return the latest backup file
  const files = await getBackupFiles();
  return files.length > 0 ? files[0] : null;
}
