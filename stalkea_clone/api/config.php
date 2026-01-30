<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// CONFIG PROXY
$remote_url = "https://stalkea.ai/api/config.php";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $remote_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_REFERER, "https://stalkea.ai/");
curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($http_code);

if ($http_code != 200 || empty($response)) {
    // Fallback config if remote fails
    echo json_encode([
        "status" => "success",
        "data" => [
            "pixel_fb" => "",
            "gtm_id" => "",
            "checkout_url" => "cta.html"
        ]
    ]);
} else {
    echo $response;
}
?>