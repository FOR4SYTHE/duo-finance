export async function processAndCompressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            
            img.onload = () => {
                const MAX_WIDTH = 1600;
                const MAX_HEIGHT = 1600;
                let width = img.width;
                let height = img.height;
                
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
                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error("Could not get canvas context"));
                    return;
                }
                
                // Use better image smoothing
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                ctx.drawImage(img, 0, 0, width, height);
                
                // Compress to WebP with 0.9 quality for sharper profile pictures
                const dataUrl = canvas.toDataURL('image/webp', 0.9);
                resolve(dataUrl);
            };
            
            img.onerror = (error) => reject(error);
        };
        
        reader.onerror = (error) => reject(error);
    });
}

export async function getCroppedAvatar(imageSrc: string, zoom: number, pan: { x: number, y: number }): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Crucial for Supabase URLs
        img.src = imageSrc;
        
        img.onload = () => {
            try {
                const size = 400; // Output high-res 400x400 avatar
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error("No canvas context"));
                
                // Replicate object-cover math
                const baseScale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
                const baseWidth = img.naturalWidth * baseScale;
                const baseHeight = img.naturalHeight * baseScale;
                const baseX = (size - baseWidth) / 2;
                const baseY = (size - baseHeight) / 2;
                
                // Container in UI is 92px. We map the UI pan pixels to our 400px canvas space.
                const panScale = size / 92;
                
                // Move origin to center to scale around center
                ctx.translate(size/2, size/2);
                // Apply pan
                ctx.translate(pan.x * panScale, pan.y * panScale);
                // Apply zoom
                ctx.scale(zoom, zoom);
                // Move origin back
                ctx.translate(-size/2, -size/2);
                
                ctx.drawImage(img, baseX, baseY, baseWidth, baseHeight);
                
                // Export as WebP for optimal size (typically < 30KB)
                resolve(canvas.toDataURL('image/webp', 0.85));
            } catch (err) {
                reject(err);
            }
        };
        
        img.onerror = (error) => reject(error);
    });
}
