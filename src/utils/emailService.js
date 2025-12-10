import emailjs from '@emailjs/browser';

// REPLACE THESE WITH YOUR ACTUAL EMAILJS KEYS
const SERVICE_ID = 'YOUR_SERVICE_ID';
const TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

export const sendTreeAnalysisEmail = async (data) => {
    try {
        const templateParams = {
            customer_name: data.name || 'Valued Customer',
            customer_email: data.email || 'Not provided',
            customer_phone: data.phone || 'Not provided',
            request_date: new Date().toLocaleDateString(),
            request_time: new Date().toLocaleTimeString(),
            ai_analysis: data.analysis || 'No analysis provided',
            estimated_price: data.price || 'Pending Assessment',
            tree_image_url: data.imageUrl || 'Image available in chat history',
        };

        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            templateParams,
            PUBLIC_KEY
        );

        console.log('SUCCESS!', response.status, response.text);
        return { success: true, message: 'Email sent successfully!' };
    } catch (error) {
        console.error('FAILED...', error);
        return { success: false, message: 'Failed to send email.', error };
    }
};
