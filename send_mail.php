<?php
// 1. Check if the user clicked the "Submit" button
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // 2. Collect the data from the form
    $name = strip_tags(trim($_POST["full_name"]));
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $subject = strip_tags(trim($_POST["subject"]));
    $mobile = strip_tags(trim($_POST["mobile"]));
    $message = trim($_POST["message"]);

    // 3. Configure the email
    $recipient = "yash@yourdomain.com"; // CHANGE THIS to your email
    $email_subject = "New Contact from: $name";
    $email_content = "Name: $name\n";
    $email_content .= "Email: $email\n\n";
    $email_content .= "Mobile: $mobile\n\n";
    $email_content .= "Message:\n$message\n";

    $headers = "From: $name <$email>";

    // 4. Send the email using PHP's mail() function
    if (mail(to: $recipient, subject: $email_subject, message: $email_content, additional_headers: $headers)) {
        // Redirect to a Thank You page (Great for Google Ads tracking)
        header(header: "Location: thank-you.html");
        exit;
    } else {
        echo "Oops! Something went wrong and we couldn't send your message.";
    }

} else {
    // If someone tries to open this file directly, kick them back to the form
    header(header: "Location: index.html");
    exit;
}
?>