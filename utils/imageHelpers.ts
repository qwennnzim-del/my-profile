
/**
 * Mengkompres gambar di sisi client sebelum upload.
 * OPTIMISASI:
 * 1. Jika file < 1MB, langsung return original file (Instan).
 * 2. Max resolusi 1600px (cukup untuk HD web).
 * 3. Quality 0.7 agar encoding lebih cepat.
 */
export const compressImage = (file: File): Promise<Blob> => {
  // FAST PATH: Jika ukuran file di bawah 1 MB, tidak perlu dikompres.
  // Langsung kembalikan file aslinya. Ini mengatasi masalah upload lama pada file kecil.
  if (file.size < 1 * 1024 * 1024) { 
    return Promise.resolve(file);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Turunkan sedikit ke 1600px agar processing canvas lebih enteng di HP kentang
        const MAX_WIDTH = 1600; 
        const MAX_HEIGHT = 1600;
        let width = img.width;
        let height = img.height;

        // Resize logic maintain aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Optimasi rendering canvas
        if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'medium'; // 'high' bikin berat, 'medium' cukup
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to Blob (JPEG quality 0.7 - Sweet spot size vs quality)
            canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas to Blob failed'));
            },
            'image/jpeg',
            0.7 
            );
        } else {
            reject(new Error('Canvas context failed'));
        }
      };
      
      img.onerror = (error) => reject(error);
    };
    
    reader.onerror = (error) => reject(error);
  });
};
