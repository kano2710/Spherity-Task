const USER_ID_KEY = 'vc_wallet_user_id';

function generateUserId() {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `user-${timestamp}-${randomPart}`;
}

export function getUserId() {
    let userId = localStorage.getItem(USER_ID_KEY);

    if (!userId) {
        userId = generateUserId();
        localStorage.setItem(USER_ID_KEY, userId);
        console.log('New user ID generated:', userId);
    }

    return userId;
}

export function getDisplayUserId() {
    const userId = getUserId();
    return userId.substring(0, 20) + '...';
}