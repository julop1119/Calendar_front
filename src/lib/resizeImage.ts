/** 업로드한 이미지를 정사각형으로 크롭 + 축소해서 data URL로 반환한다 (localStorage에 가볍게 저장하기 위함). */
export function resizeImageToDataUrl(file: File, size = 64): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('이미지를 불러오지 못했습니다'))
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('캔버스를 지원하지 않습니다'))
          return
        }
        const scale = Math.max(size / img.width, size / img.height)
        const drawWidth = img.width * scale
        const drawHeight = img.height * scale
        ctx.drawImage(img, (size - drawWidth) / 2, (size - drawHeight) / 2, drawWidth, drawHeight)
        resolve(canvas.toDataURL('image/png'))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
