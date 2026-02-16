import emailjs from '@emailjs/browser';

export const sendNotificationEmail = async (title, message) => {
    const userData = JSON.parse(localStorage.getItem('user_data'));
    const notifSettings = JSON.parse(localStorage.getItem('user_notifications'));

    if (!userData || !notifSettings?.email) return;

    // These keys must match the {{variables}} in EmailJS template!
    const templateParams = {
        name: userData.name,
        email: userData.email,
        title: title,
        message: message,
        time: new Date().toLocaleString()
    };

    try {

        const result = await emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
            templateParams,
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
        return result;
    } catch (error) {
        console.error("Failed to send email:", error);
    }
};