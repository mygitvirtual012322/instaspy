<?php
// PHP PROXY - STALKEA CLONE
// Esse arquivo redireciona as requisições para a API original do Stalkea.ai
// Permitindo usar os dados reais sem ter o backend original.

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// URL base da API original
$target_url = "https://stalkea.ai/scripts/api/instagram-api.min.js"; // Endpoint provável ou similar
// Nota: O site original pode usar endpoints diferentes. Vamos mapear o mais comum.
// Baseado na análise, os endpoints reais parecem ser algo como /api/instagram.php ou tratados via rota.
// Como não temos acesso ao servidor, vamos tentar simular a chamada copiando os parametros.

// TENTATIVA 1: Chamar a URL exata que o JS chamaria no site original
// Se o JS original chama "api/instagram.php", nós chamamos "https://stalkea.ai/api/instagram.php"

$endpoint = basename($_SERVER['PHP_SELF']); // ex: instagram.php
$query = $_SERVER['QUERY_STRING'];
$remote_url = "https://stalkea.ai/api/" . $endpoint . ($query ? "?" . $query : "");

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $remote_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

// FINGIR SER O SITE ORIGINAL (REFERER SPOOFING)
curl_setopt($ch, CURLOPT_REFERER, "https://stalkea.ai/");
curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);

// Repassar Cookies se necessário (avançado, mas pode ajudar)
// curl_setopt($ch, CURLOPT_COOKIE, "session_id=...");

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Setar o código de resposta correto
http_response_code($http_code);

// Se der erro ou vazio, retornar um JSON de erro tratado pra não quebrar o front
if ($http_code != 200 || empty($response)) {
    // Fallback se a proteção deles barrar (Cloudflare, etc)
    echo json_encode([
        "status" => "error",
        "message" => "Erro ao conectar com API original. Código: $http_code"
    ]);
} else {
    echo $response;
}
?>
