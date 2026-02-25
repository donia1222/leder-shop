<?php
/**
 * Funciones para gestión de emails de confirmación
 * Separado del archivo principal para mejor organización
 */

// Función para enviar email de confirmación de factura
function sendInvoiceConfirmationEmail($data) {
    $customerInfo = $data['customerInfo'];
    $billingAddress = $data['billingAddress'] ?? null;
    $cart = $data['cart'];
    $total = $data['total'];
    $orderNumber = $data['orderNumber'];
    
    // Configuración de emails
    $toStore = 'info@leder-shop.ch';
    $toCustomer = $customerInfo['email'];
    $fromEmail = 'info@leder-shop.ch';

    // ===== EMAIL PARA LA TIENDA (Factura) =====
    $storeSubject = '🛍️ NEUE BESTELLUNG - Leder-Shop - ' . $orderNumber;
    $storeEmailContent = generateStoreInvoiceEmail($customerInfo, $billingAddress, $cart, $total, $orderNumber);

    // ===== EMAIL PARA EL CLIENTE (Factura) =====
    $customerSubject = '✅ Bestellbestätigung - Leder-Shop';
    $customerEmailContent = generateCustomerInvoiceEmail($customerInfo, $billingAddress, $cart, $total, $orderNumber);
    
    // Headers para emails HTML
    $storeHeaders = "MIME-Version: 1.0\r\n";
    $storeHeaders .= "Content-type: text/html; charset=UTF-8\r\n";
    $storeHeaders .= "From: {$fromEmail}\r\n";
    $storeHeaders .= "Reply-To: {$customerInfo['email']}\r\n";
    
    $customerHeaders = "MIME-Version: 1.0\r\n";
    $customerHeaders .= "Content-type: text/html; charset=UTF-8\r\n";
    $customerHeaders .= "From: {$fromEmail}\r\n";
    $customerHeaders .= "Reply-To: {$fromEmail}\r\n";
    
    // Enviar emails
    $storeEmailSent = mail($toStore, $storeSubject, $storeEmailContent, $storeHeaders);
    $customerEmailSent = mail($toCustomer, $customerSubject, $customerEmailContent, $customerHeaders);
    
    return [
        'success' => ($storeEmailSent && $customerEmailSent),
        'storeEmailSent' => $storeEmailSent,
        'customerEmailSent' => $customerEmailSent
    ];
}

function generateStoreInvoiceEmail($customerInfo, $billingAddress, $cart, $total, $orderNumber) {
    $subtotal = 0;
    foreach ($cart as $item) {
        $subtotal += $item['price'] * $item['quantity'];
    }

    $content = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #2d2d2d; background-color: #f5f0e8; }
            .header { background-color: #3b2a1a; color: white; padding: 24px 20px; text-align: center; }
            .header img { width: 160px; height: 160px; object-fit: contain; margin-bottom: 10px; }
            .header h1 { margin: 0; font-size: 22px; letter-spacing: 1px; }
            .header p { margin: 4px 0 0; color: #d4b896; font-size: 14px; }
            .content { padding: 24px; max-width: 600px; margin: 0 auto; }
            .urgent { background-color: #fff8e7; padding: 15px; margin: 15px 0; border-radius: 6px; border-left: 4px solid #c8861a; }
            .order-details { background-color: #ffffff; padding: 15px; margin: 15px 0; border-radius: 6px; border: 1px solid #ddd; }
            .customer-info { background-color: #eef4f0; padding: 15px; margin: 15px 0; border-radius: 6px; border: 1px solid #c5d9c8; }
            .product-item { border-bottom: 1px solid #eee; padding: 10px 0; }
            .total { font-weight: bold; font-size: 18px; color: #3b2a1a; }
            .next-steps { background-color: #eef4f0; padding: 15px; margin: 15px 0; border-radius: 6px; border: 1px solid #c5d9c8; }
            .footer { text-align: center; margin-top: 24px; padding: 16px; background-color: #3b2a1a; color: #d4b896; font-size: 13px; border-radius: 6px; }
        </style>
    </head>
    <body>
        <div class='header'>
            <h1>🛍️ NEUE BESTELLUNG - Leder-Shop</h1>
            <p>HANDGEMACHT · SCHWEIZ — Kauf auf Rechnung &amp; Vorkasse</p>
        </div>

        <div class='content'>
            <div class='urgent'>
                <h2>⚠️ AKTION ERFORDERLICH</h2>
                <p><strong>Neue Bestellung eingegangen — Kunden so bald wie möglich kontaktieren!</strong></p>
                <p>Bestellnummer: <strong>{$orderNumber}</strong></p>
                <p>📧 E-Mail: <strong>{$customerInfo['email']}</strong> &nbsp;|&nbsp; 📞 Telefon: <strong>{$customerInfo['phone']}</strong></p>
                <p>Bitte nehmen Sie Kontakt auf, um die Bestellung und Zahlung abzuschließen.</p>
            </div>

            <div class='order-details'>
                <h2>💳 Zahlungsdetails</h2>
                <p><strong>Zahlungsart:</strong> Kauf auf Rechnung &amp; Vorkasse</p>
                <p><strong>Bestellnummer:</strong> {$orderNumber}</p>
                <p><strong>Datum:</strong> " . date('d.m.Y H:i') . "</p>
                <p><strong>Betrag:</strong> <span class='total'>{$total} CHF</span></p>
            </div>

            <div class='customer-info'>
                <h2>👤 Kundeninformationen</h2>
                <p><strong>Name:</strong> {$customerInfo['firstName']} {$customerInfo['lastName']}</p>
                <p><strong>E-Mail:</strong> {$customerInfo['email']}</p>
                <p><strong>Telefon:</strong> {$customerInfo['phone']}</p>
                <h3>📮 Lieferadresse:</h3>
                <p><strong>{$customerInfo['firstName']} {$customerInfo['lastName']}</strong></p>
                <p>{$customerInfo['address']}</p>
                <p>{$customerInfo['postalCode']} {$customerInfo['city']}</p>
                <p><strong>Kanton:</strong> {$customerInfo['canton']}</p>";

    if ($billingAddress) {
        $content .= "
                <h3>💳 Rechnungsadresse (ANDERS ALS LIEFERADRESSE):</h3>
                <p style='background-color: #fff8e7; padding: 10px; border-radius: 5px; border-left: 4px solid #c8861a;'>
                    <strong>⚠️ WICHTIG: Rechnung an andere Adresse senden!</strong>
                </p>
                <p><strong>{$billingAddress['firstName']} {$billingAddress['lastName']}</strong></p>
                <p>{$billingAddress['address']}</p>
                <p>{$billingAddress['postalCode']} {$billingAddress['city']}</p>
                <p><strong>Kanton:</strong> {$billingAddress['canton']}</p>";
    } else {
        $content .= "
                <h3>💳 Rechnungsadresse:</h3>
                <p><em>Gleich wie Lieferadresse</em></p>";
    }

    if (!empty($customerInfo['notes'])) {
        $content .= "<p><strong>⚠️ Besondere Hinweise:</strong> {$customerInfo['notes']}</p>";
    }

    $content .= "
            </div>

            <div class='order-details'>
                <h2>🛒 Bestellte Produkte</h2>";

    foreach ($cart as $item) {
        $itemTotal = $item['price'] * $item['quantity'];
        $content .= "
                <div class='product-item'>
                    <p><strong>{$item['name']}</strong></p>
                    <p>Menge: <strong>{$item['quantity']}</strong> x {$item['price']} CHF = <strong>{$itemTotal} CHF</strong></p>
                    <p><em>{$item['description']}</em></p>
                </div>";
    }

    $content .= "
                <div style='margin-top: 20px; padding-top: 15px; border-top: 2px solid #3b2a1a;'>
                    <p><strong>Zwischensumme:</strong> {$subtotal} CHF</p>
                    <p><strong>Versand:</strong> Kostenlos</p>
                    <p class='total'>GESAMT: {$total} CHF</p>
                </div>
            </div>

            <div class='next-steps'>
                <h3>📋 Nächste Schritte</h3>
                <p>📞 1. Kunden kontaktieren per E-Mail oder Telefon</p>
                <p>💬 2. Zahlungsmodalitäten mit Kunden abklären (Rechnung / Vorkasse)</p>
                <p>📦 3. Bestellung vorbereiten und versenden</p>
                <p>📧 4. Tracking-Nummer an Kunde senden: {$customerInfo['email']}</p>
            </div>

            <div class='footer'>
                <p><strong>Leder-Shop</strong> — HANDGEMACHT · SCHWEIZ</p>
                <p>9468 Sax (SG) &nbsp;|&nbsp; 📞 077 416 73 75 &nbsp;|&nbsp; info@leder-shop.ch</p>
            </div>
        </div>
    </body>
    </html>";

    return $content;
}

function generateCustomerInvoiceEmail($customerInfo, $billingAddress, $cart, $total, $orderNumber) {
    $subtotal = 0;
    foreach ($cart as $item) {
        $subtotal += $item['price'] * $item['quantity'];
    }

    $content = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f4f4f4; }
            .header { background-color: #ffffff; color: #1a1a1a; padding: 24px 20px; text-align: center; border-bottom: 3px solid #2a6496; }
            .header img { width: 160px; height: 160px; object-fit: contain; margin-bottom: 10px; }
            .header h1 { margin: 0; font-size: 22px; letter-spacing: 1px; color: #1a1a1a; }
            .header p { margin: 4px 0 0; color: #555; font-size: 14px; }
            .content { padding: 24px; max-width: 600px; margin: 0 auto; }
            .thank-you { background-color: #eef4f0; padding: 20px; margin: 15px 0; border-radius: 6px; text-align: center; border: 1px solid #c5d9c8; }
            .order-details { background-color: #ffffff; padding: 15px; margin: 15px 0; border-radius: 6px; border: 1px solid #ddd; }
            .product-item { border-bottom: 1px solid #eee; padding: 8px 0; }
            .total { font-weight: bold; font-size: 18px; color: #2a6496; }
            .info-box { background-color: #e8f4fd; padding: 15px; margin: 15px 0; border-radius: 6px; border-left: 4px solid #2a6496; }
            .footer { text-align: center; margin-top: 24px; padding: 16px; background-color: #ffffff; color: #555; font-size: 13px; border-radius: 6px; border-top: 3px solid #2a6496; }
        </style>
    </head>
    <body>
        <div class='header'>
            <h1>🛍️ Leder-Shop</h1>
            <p>HANDGEMACHT · SCHWEIZ</p>
        </div>

        <div class='content'>
            <div class='thank-you'>
                <h2>✅ Bestellung bestätigt!</h2>
                <p>Liebe/r {$customerInfo['firstName']},</p>
                <p>Vielen Dank für Ihre Bestellung bei <strong>Leder-Shop</strong>!<br>
                Ihre Bestellung wurde erfolgreich aufgenommen.</p>
            </div>

            <div class='info-box'>
                <h3>📞 Wie geht es weiter?</h3>
                <p>Unser Verkäufer wird Sie <strong>so bald wie möglich per E-Mail oder Telefon kontaktieren</strong>, um die Bestellung und die Zahlung gemeinsam mit Ihnen abzuschließen.</p>
            </div>

            <div class='order-details'>
                <h2>📋 Ihre Bestelldetails</h2>
                <p><strong>Bestellnummer:</strong> {$orderNumber}</p>
                <p><strong>Datum:</strong> " . date('d.m.Y H:i') . "</p>
                <p><strong>Zahlungsart:</strong> Kauf auf Rechnung &amp; Vorkasse</p>
                <p><strong>Verwendungszweck:</strong> <strong style='font-size:16px;'>{$orderNumber}</strong></p>
                <p><strong>Status:</strong> ✅ Bestätigt — Zahlung ausstehend</p>
                <p><strong>Betrag:</strong> <span class='total'>{$total} CHF</span></p>
            </div>

            <div class='order-details'>
                <h2>🛒 Bestellte Produkte</h2>";

    foreach ($cart as $item) {
        $itemTotal = $item['price'] * $item['quantity'];
        $content .= "
                <div class='product-item'>
                    <p><strong>{$item['name']}</strong></p>
                    <p>Menge: {$item['quantity']} x {$item['price']} CHF = <strong>{$itemTotal} CHF</strong></p>
                </div>";
    }

    $content .= "
                <div style='margin-top: 20px; padding-top: 15px; border-top: 2px solid #2a6496;'>
                    <p><strong>Zwischensumme:</strong> {$subtotal} CHF</p>
                    <p><strong>Versand:</strong> Kostenlos</p>
                    <p class='total'>GESAMT: {$total} CHF</p>
                </div>
            </div>

            <div class='order-details'>
                <h2>📮 Lieferadresse</h2>
                <p><strong>{$customerInfo['firstName']} {$customerInfo['lastName']}</strong></p>
                <p>{$customerInfo['address']}</p>
                <p>{$customerInfo['postalCode']} {$customerInfo['city']}</p>
                <p>{$customerInfo['canton']}</p>
            </div>";

    if ($billingAddress) {
        $content .= "
            <div class='order-details'>
                <h2>💳 Rechnungsadresse</h2>
                <p><strong>{$billingAddress['firstName']} {$billingAddress['lastName']}</strong></p>
                <p>{$billingAddress['address']}</p>
                <p>{$billingAddress['postalCode']} {$billingAddress['city']}</p>
                <p>{$billingAddress['canton']}</p>
            </div>";
    }

    $content .= "
            <div class='footer'>
                <p><strong>Leder-Shop</strong> — HANDGEMACHT · SCHWEIZ</p>
                <p>9468 Sax (SG) &nbsp;|&nbsp; 📞 077 416 73 75 &nbsp;|&nbsp; info@leder-shop.ch</p>
                <p style='margin-top: 8px; font-size: 12px; color: #b8a080;'>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
            </div>
        </div>
    </body>
    </html>";

    return $content;
}

function sendPayPalConfirmationEmail($data) {
    $customerInfo = $data['customerInfo'];
    $billingAddress = $data['billingAddress'] ?? null;
    $cart = $data['cart'];
    $total = $data['total'];
    $orderNumber = $data['orderNumber'];
    $paypalPayerID = $data['paypalPayerID'];
    
    // Configuración de emails
    $toStore = 'info@leder-shop.ch';
    $toCustomer = $customerInfo['email'];
    $fromEmail = 'info@leder-shop.ch';

    // ===== EMAIL PARA LA TIENDA (PayPal) =====
    $storeSubject = '🛍️ NEUE BESTELLUNG - Leder-Shop - PayPal ID: ' . $paypalPayerID;
    $storeEmailContent = generateStorePayPalEmail($customerInfo, $billingAddress, $cart, $total, $orderNumber, $paypalPayerID);

    // ===== EMAIL PARA EL CLIENTE (PayPal) =====
    $customerSubject = '✅ Bestellbestätigung - Leder-Shop';
    $customerEmailContent = generateCustomerPayPalEmail($customerInfo, $billingAddress, $cart, $total, $orderNumber, $paypalPayerID);
    
    // Headers para emails HTML
    $storeHeaders = "MIME-Version: 1.0\r\n";
    $storeHeaders .= "Content-type: text/html; charset=UTF-8\r\n";
    $storeHeaders .= "From: {$fromEmail}\r\n";
    $storeHeaders .= "Reply-To: {$customerInfo['email']}\r\n";
    
    $customerHeaders = "MIME-Version: 1.0\r\n";
    $customerHeaders .= "Content-type: text/html; charset=UTF-8\r\n";
    $customerHeaders .= "From: {$fromEmail}\r\n";
    $customerHeaders .= "Reply-To: {$fromEmail}\r\n";
    
    // Enviar emails
    $storeEmailSent = mail($toStore, $storeSubject, $storeEmailContent, $storeHeaders);
    $customerEmailSent = mail($toCustomer, $customerSubject, $customerEmailContent, $customerHeaders);
    
    return [
        'success' => ($storeEmailSent && $customerEmailSent),
        'storeEmailSent' => $storeEmailSent,
        'customerEmailSent' => $customerEmailSent
    ];
}

function generateStorePayPalEmail($customerInfo, $billingAddress, $cart, $total, $orderNumber, $paypalPayerID) {
    $subtotal = 0;
    foreach ($cart as $item) {
        $subtotal += $item['price'] * $item['quantity'];
    }
    
    $timestamp = date('Y-m-d H:i:s');
    
    $content = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .urgent { background-color: #fff3cd; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #ffc107; }
            .order-details { background-color: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .customer-info { background-color: #e7f3ff; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .product-item { border-bottom: 1px solid #eee; padding: 10px 0; }
            .total { font-weight: bold; font-size: 18px; color: #dc3545; }
            .next-steps { background-color: #d4edda; padding: 15px; margin: 15px 0; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class='header'>
            <h1>🛍️ NEUE BESTELLUNG - Leder-Shop</h1>
            <p>HANDGEMACHT · SCHWEIZ — Zahlung erfolgreich über PayPal verarbeitet!</p>
        </div>
        
        <div class='content'>
            <div class='urgent'>
                <h2>⚡ SOFORTIGE BEARBEITUNG ERFORDERLICH</h2>
                <p><strong>Neue Bestellung eingegangen - Sofort bearbeiten</strong></p>
                <p>PayPal ID: <strong>{$paypalPayerID}</strong></p>
            </div>

            <div class='order-details'>
                <h2>💳 Zahlungsdetails</h2>
                <p><strong>PayPal Payer ID:</strong> {$paypalPayerID}</p>
                <p><strong>Bestellnummer:</strong> {$orderNumber}</p>
                <p><strong>Datum und Zeit:</strong> {$timestamp}</p>
                <p><strong>Status:</strong> ✅ BEZAHLT UND BESTÄTIGT</p>
                <p><strong>Bezahlter Betrag:</strong> <span class='total'>{$total} CHF</span></p>
            </div>

            <div class='customer-info'>
                <h2>👤 Kundeninformationen</h2>
                <p><strong>Name:</strong> {$customerInfo['firstName']} {$customerInfo['lastName']}</p>
                <p><strong>E-Mail:</strong> {$customerInfo['email']}</p>
                <p><strong>Telefon:</strong> {$customerInfo['phone']}</p>
                <h3>📮 Lieferadresse:</h3>
                <p>{$customerInfo['address']}</p>
                <p>{$customerInfo['postalCode']} {$customerInfo['city']}</p>
                <p><strong>Kanton:</strong> {$customerInfo['canton']}</p>";
    
    // Agregar dirección de facturación si es diferente
    if ($billingAddress) {
        $content .= "
                <h3>💳 Rechnungsadresse (ANDERS ALS LIEFERADRESSE):</h3>
                <p style='background-color: #fef3c7; padding: 10px; border-radius: 5px; border-left: 4px solid #f59e0b;'>
                    <strong>⚠️ WICHTIG: Rechnung an andere Adresse senden!</strong>
                </p>
                <p><strong>{$billingAddress['firstName']} {$billingAddress['lastName']}</strong></p>
                <p>{$billingAddress['address']}</p>
                <p>{$billingAddress['postalCode']} {$billingAddress['city']}</p>
                <p><strong>Kanton:</strong> {$billingAddress['canton']}</p>";
    } else {
        $content .= "
                <h3>💳 Rechnungsadresse:</h3>
                <p><em>Gleich wie Lieferadresse</em></p>";
    }
    
    if (!empty($customerInfo['notes'])) {
        $content .= "<p><strong>⚠️ Besondere Hinweise:</strong> {$customerInfo['notes']}</p>";
    }
    
    $content .= "
            </div>

            <div class='order-details'>
                <h2>🛒 Zu versendende Produkte</h2>";
    
    foreach ($cart as $item) {
        $itemTotal = $item['price'] * $item['quantity'];
        $content .= "
                <div class='product-item'>
                    <p><strong>{$item['name']}</strong></p>
                    <p>Menge: <strong>{$item['quantity']}</strong> x {$item['price']} CHF = <strong>{$itemTotal} CHF</strong></p>
                    <p><em>{$item['description']}</em></p>
                </div>";
    }
    
    $content .= "
                <div style='margin-top: 20px; padding-top: 15px; border-top: 2px solid #dc3545;'>
                    <p><strong>Zwischensumme:</strong> {$subtotal} CHF</p>
                    <p><strong>Versand:</strong> Kostenlos</p>
                    <p class='total'>GESAMT BEZAHLT: {$total} CHF</p>
                </div>
            </div>

            <div class='next-steps'>
                <h3>📦 Nächste Schritte</h3>
                <p>✅ Zahlung von PayPal bestätigt</p>
                <p>📋 Bestellung bearbeiten und Versand vorbereiten</p>
                <p>📮 Versand in 2-3 Werktagen an:</p>
                <p><strong>{$customerInfo['address']}, {$customerInfo['postalCode']} {$customerInfo['city']}</strong></p>
                <p>📧 Tracking-Nummer an Kunde senden: {$customerInfo['email']}</p>
            </div>
        </div>
    </body>
    </html>";
    
    return $content;
}

function generateCustomerPayPalEmail($customerInfo, $billingAddress, $cart, $total, $orderNumber, $paypalPayerID) {
    $subtotal = 0;
    foreach ($cart as $item) {
        $subtotal += $item['price'] * $item['quantity'];
    }
    
    $timestamp = date('Y-m-d H:i:s');
    
    $content = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .thank-you { background-color: #d4edda; padding: 20px; margin: 15px 0; border-radius: 5px; text-align: center; }
            .order-details { background-color: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .product-item { border-bottom: 1px solid #eee; padding: 10px 0; }
            .total { font-weight: bold; font-size: 18px; color: #dc3545; }
            .shipping-info { background-color: #e7f3ff; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 30px; padding: 20px; background-color: #f8f9fa; }
        </style>
    </head>
    <body>
        <div class='header'>
            <h1>🛍️ Leder-Shop</h1>
            <p>HANDGEMACHT · SCHWEIZ — Vielen Dank für Ihre Bestellung!</p>
        </div>

        <div class='content'>
            <div class='thank-you'>
                <h2>✅ Bestellung bestätigt!</h2>
                <p>Liebe/r {$customerInfo['firstName']},</p>
                <p>Vielen Dank für Ihre Bestellung bei <strong>Leder-Shop</strong>! Ihre Zahlung wurde erfolgreich verarbeitet.</p>
            </div>

            <div class='order-details'>
                <h2>📋 Ihre Bestelldetails</h2>
                <p><strong>Bestellnummer:</strong> {$orderNumber}</p>
                <p><strong>PayPal ID:</strong> {$paypalPayerID}</p>
                <p><strong>Datum:</strong> " . date('d.m.Y H:i', strtotime($timestamp)) . "</p>
                <p><strong>Status:</strong> ✅ Bezahlt</p>
            </div>

            <div class='order-details'>
                <h2>🛒 Bestellte Produkte</h2>";
    
    foreach ($cart as $item) {
        $itemTotal = $item['price'] * $item['quantity'];
        $content .= "
                <div class='product-item'>
                    <p><strong>{$item['name']}</strong></p>
                    <p>Menge: {$item['quantity']} x {$item['price']} CHF = {$itemTotal} CHF</p>
                    <p><em>{$item['description']}</em></p>
                </div>";
    }
    
    $content .= "
                <div style='margin-top: 20px; padding-top: 15px; border-top: 2px solid #dc3545;'>
                    <p><strong>Zwischensumme:</strong> {$subtotal} CHF</p>
                    <p><strong>Versand:</strong> Kostenlos</p>
                    <p class='total'>GESAMT: {$total} CHF</p>
                </div>
            </div>

            <div class='order-details'>
                <h2>📮 Lieferadresse</h2>
                <p><strong>{$customerInfo['firstName']} {$customerInfo['lastName']}</strong></p>
                <p>{$customerInfo['address']}</p>
                <p>{$customerInfo['postalCode']} {$customerInfo['city']}</p>
                <p>{$customerInfo['canton']}</p>
            </div>";
    
    // Agregar dirección de facturación si es diferente
    if ($billingAddress) {
        $content .= "
            <div class='order-details'>
                <h2>💳 Rechnungsadresse</h2>
                <div style='background-color: #fef3c7; padding: 15px; margin-bottom: 15px; border-radius: 5px; border-left: 4px solid #f59e0b;'>
                    <p><strong>Ihre Rechnung wird an diese abweichende Adresse gesendet:</strong></p>
                </div>
                <p><strong>{$billingAddress['firstName']} {$billingAddress['lastName']}</strong></p>
                <p>{$billingAddress['address']}</p>
                <p>{$billingAddress['postalCode']} {$billingAddress['city']}</p>
                <p>{$billingAddress['canton']}</p>
            </div>";
    }
    
    $content .= "

            <div class='shipping-info'>
                <h3>📦 Was passiert als nächstes?</h3>
                <p>✅ Ihre Zahlung wurde bestätigt</p>
                <p>📦 Wir bereiten Ihre Bestellung vor</p>
                <p>🚚 Versand in 2-3 Werktagen</p>
                <p>📧 Sie erhalten eine Tracking-Nummer per E-Mail</p>
                <p>📞 Bei Fragen: <a href='tel:0774167375' style='color:#dc3545;'>077 416 73 75</a> | info@leder-shop.ch</p>
            </div>

            <div class='footer'>
                <p><strong>Leder-Shop</strong> — HANDGEMACHT · SCHWEIZ</p>
                <p>9468 Sax (SG) &nbsp;|&nbsp; 077 416 73 75 &nbsp;|&nbsp; info@leder-shop.ch</p>
            </div>
        </div>
    </body>
    </html>";

    return $content;
}

// ─────────────────────────────────────────────────────────────────────────────
// TWINT emails
// ─────────────────────────────────────────────────────────────────────────────

function sendTwintConfirmationEmail($data) {
    $customerInfo = $data['customerInfo'];
    $cart = $data['cart'];
    $total = $data['total'];
    $orderNumber = $data['orderNumber'];

    // Read TWINT phone from payment_settings table
    $twintPhone = '';
    try {
        require_once __DIR__ . '/config.php';
        $pdo = getDBConnection();
        $row = $pdo->query("SELECT twint_phone FROM payment_settings WHERE id = 1")->fetch();
        if ($row) $twintPhone = $row['twint_phone'];
    } catch (Exception $e) {}

    $toStore    = 'info@leder-shop.ch';
    $toCustomer = $customerInfo['email'];
    $fromEmail  = 'info@leder-shop.ch';

    // Store email
    $storeSubject = '📱 NEUE TWINT-BESTELLUNG - ' . $orderNumber;
    $storeBody = "
    <!DOCTYPE html><html><head><meta charset='UTF-8'>
    <style>
        body{font-family:Arial,sans-serif;background:#f4f4f4;color:#1a1a1a}
        .wrap{max-width:600px;margin:0 auto;padding:24px}
        .hdr{background:#1a1a1a;color:#fff;padding:20px;border-radius:8px 8px 0 0;text-align:center}
        .box{background:#fff;border:1px solid #ddd;border-radius:6px;padding:16px;margin:12px 0}
        .ref{font-size:22px;font-weight:900;font-family:monospace;color:#1a1a1a}
        .foot{text-align:center;color:#888;font-size:12px;margin-top:16px}
    </style></head><body><div class='wrap'>
    <div class='hdr'><h2>📱 NEUE TWINT-BESTELLUNG</h2><p>Zahlung ausstehend — bitte prüfen</p></div>
    <div class='box'>
        <p><strong>Bestellnummer:</strong> <span class='ref'>{$orderNumber}</span></p>
        <p><strong>Betrag:</strong> {$total} CHF</p>
        <p><strong>Kunde:</strong> {$customerInfo['firstName']} {$customerInfo['lastName']}</p>
        <p><strong>E-Mail:</strong> {$customerInfo['email']}</p>
        <p><strong>Telefon:</strong> {$customerInfo['phone']}</p>
    </div>
    <div class='box'>
        <p>Der Kunde wurde angewiesen, per TWINT (<strong>{$twintPhone}</strong>) zu bezahlen.<br>
        Referenz: <strong>{$orderNumber}</strong></p>
    </div>
    <div class='foot'>Leder-Shop · HANDGEMACHT · SCHWEIZ · 9468 Sax (SG) · 077 416 73 75 · info@leder-shop.ch</div>
    </div></body></html>";

    // Customer email
    $customerSubject = '✅ Bestellbestätigung – Bitte TWINT-Zahlung durchführen';
    $customerBody = "
    <!DOCTYPE html><html><head><meta charset='UTF-8'>
    <style>
        body{font-family:Arial,sans-serif;background:#f4f4f4;color:#1a1a1a}
        .wrap{max-width:600px;margin:0 auto;padding:24px}
        .hdr{background:#1a1a1a;color:#fff;padding:20px;border-radius:8px 8px 0 0;text-align:center}
        .box{background:#fff;border:1px solid #ddd;border-radius:6px;padding:16px;margin:12px 0}
        .twint{background:#111;color:#fff;border-radius:8px;padding:16px;margin:12px 0}
        .phone{font-size:28px;font-weight:900;letter-spacing:2px}
        .ref{display:inline-block;background:#fff;color:#000;font-family:monospace;font-weight:900;font-size:18px;padding:6px 12px;border-radius:4px;margin-top:4px}
        .foot{text-align:center;color:#888;font-size:12px;margin-top:16px}
    </style></head><body><div class='wrap'>
    <div class='hdr'><h2>✅ Bestellung bestätigt!</h2><p>Bitte TWINT-Zahlung durchführen</p></div>
    <div class='box'>
        <p>Liebe/r <strong>{$customerInfo['firstName']}</strong>,</p>
        <p>Ihre Bestellung wurde erfolgreich aufgenommen. Bitte führen Sie die Zahlung per TWINT durch:</p>
    </div>
    <div class='twint'>
        <p style='margin:0 0 8px'>📱 TWINT-Empfänger:</p>
        <p class='phone'>{$twintPhone}</p>
        <p style='margin:12px 0 4px'>Betrag: <strong>{$total} CHF</strong></p>
        <p style='margin:4px 0'>Bestellnummer als Verwendungszweck:</p>
        <span class='ref'>{$orderNumber}</span>
    </div>
    <div class='box' style='font-size:13px;color:#555'>
        <p><strong>Bestellnummer:</strong> {$orderNumber}</p>
        <p>Ihre Bestellung wird nach Eingang der Zahlung bearbeitet.</p>
    </div>
    <div class='foot'>Leder-Shop · HANDGEMACHT · SCHWEIZ · 9468 Sax (SG) · 077 416 73 75 · info@leder-shop.ch</div>
    </div></body></html>";

    $headers = "MIME-Version: 1.0\r\nContent-type: text/html; charset=UTF-8\r\nFrom: {$fromEmail}\r\n";
    $cHeaders = $headers . "Reply-To: {$fromEmail}\r\n";
    $sHeaders = $headers . "Reply-To: {$customerInfo['email']}\r\n";

    return [
        'success' => mail($toStore, $storeSubject, $storeBody, $sHeaders) && mail($toCustomer, $customerSubject, $customerBody, $cHeaders)
    ];
}
?>