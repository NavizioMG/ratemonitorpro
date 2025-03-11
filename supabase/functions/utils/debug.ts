export const debug = {
  logInfo: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  },
  logError: (message: string, data?: any) => {
    console.error(`[ERROR] ${message}`, data);
  }
};