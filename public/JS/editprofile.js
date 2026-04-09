
document.addEventListener('DOMContentLoaded', function() {

    const profilePicture = document.getElementById('profilePicture');
    const profileImage = document.getElementById('profile-image');
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    
    const originalImageSrc = profileImage.src;
    profilePicture.addEventListener('change', function(e) {
        const file = e.target.files[0];
        
        if (file) {
            
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
                this.value = '';
                return;
            }
        
            const maxSize = 5 * 1024 * 1024; 
            if (file.size > maxSize) {
                alert('File size must be less than 5MB');
                this.value = '';
                return;
            }

            fileName.textContent = file.name;
            fileInfo.classList.remove('hidden');

            const reader = new FileReader();
            reader.onload = function(e) {
                profileImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
           
            fileInfo.classList.add('hidden');
            profileImage.src = originalImageSrc;
        }
    });
});
