function confirmDeleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone and will remove all your data including reservations.')) {
        const button = event.target;
        const userId = button.getAttribute('data-user-id');
        
        if (!userId) {
            alert('Error: Could not determine user ID');
            return;
        }
        
        fetch(`/deleteaccount/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            if (response.ok) {
                alert('Account deleted successfully');
                window.location.href = '/login';
            } else {
                alert('Error deleting account. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error deleting account. Please try again.');
        });
    }
}
