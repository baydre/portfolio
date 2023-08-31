<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;


$name = $_POST["name"];
$email = $_POST["email"];
$subject = $_POST["subject"];
$message = $_POST["message"];

require 'vendor/autoload.php';

$mail = new PHPMailer(true);

$mail->isSMTP();
$mail->SMTPAuth = true;

 //$mail->SMTPDebug = SMTP::DEBUG_SERVER;

$mail->Host = "smtp.gmail.com";
$mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
$mail->Port = 465;

$mail->Username = "baydre2@gmail.com";
$mail->Password = "cnhnmzbkudihjmso";

$mail->setFrom($email, $name);
$mail->addAddress("yasirmusa@sefrel.com", "Yasir");

$mail->Subject = $subject;
$mail->Body = $message;

$mail->send();

echo "Email sent successfully!";
