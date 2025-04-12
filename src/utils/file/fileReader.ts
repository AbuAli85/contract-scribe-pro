
/**
 * Utility for reading different file types
 */

export function handleFileRead(file: File, fileType: 'excel' | 'letterhead' | 'promoterPhoto'): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      if (!e.target?.result) {
        reject(new Error('Failed to read file'))
        return
      }
      
      resolve(e.target.result)
    }
    
    reader.onerror = (e) => {
      reject(e)
    }
    
    if (fileType === 'excel') {
      reader.readAsBinaryString(file)
    } else {
      reader.readAsDataURL(file)
    }
  })
}
