/**
 * Processes an image file: resizes it to fit within max dimensions and compresses it.
 * @param {File} file - The image file to process.
 * @param {number} maxWidth - Maximum width (default 800px).
 * @param {number} maxHeight - Maximum height (default 600px).
 * @param {number} quality - JPEG quality (0 to 1, default 0.7).
 * @returns {Promise<string>} - A promise that resolves to the Base64 string of the processed image.
 */
export const processImage = (file, maxWidth = 800, maxHeight = 600, quality = 0.7) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject('No file provided');
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to Base64 JPEG
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };

            img.onerror = (err) => {
                reject('Error loading image: ' + err);
            };
        };

        reader.onerror = (err) => {
            reject('Error reading file: ' + err);
        };
    });
};
