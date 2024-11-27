import smtplib
from email.mime.text import MIMEText

def send_mail():
    sender = "feroxtech.mailservice@yahoo.com"
    password = "Gcit@2024"  # Use Yahoo App Password if 2FA is enabled
    recipient = "thuktennorbu33@gmail.com"
    subject = "Test Email from Yahoo"
    body = "Hello, this is a test email sent via Yahoo SMTP."

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = recipient

    try:
        # Connect to Yahoo's SMTP server using SSL
        server = smtplib.SMTP_SSL("smtp.mail.yahoo.com", 465, timeout=30)
        server.login(sender, password)  # Authenticate with Yahoo credentials
        server.sendmail(sender, recipient, msg.as_string())  # Send the email
        print("Email sent successfully!")
    except smtplib.SMTPAuthenticationError as e:
        print(f"SMTP Authentication Error: {e.smtp_code} - {e.smtp_error}")
    except smtplib.SMTPServerDisconnected as e:
        print(f"SMTP Server Disconnected: {e}")
    except Exception as e:
        print(f"Error sending email: {e}")
    finally:
        try:
            server.quit()
        except smtplib.SMTPServerDisconnected:
            print("Server already disconnected. No need to quit.")

send_mail()
