

$(function(){
	var qrcode = new QRCode(document.getElementById("qrcode"), {
		width : 100,
		height : 100
	});
	
	qrcode.makeCode($("#qrcode").text());
	JsBarcode("#barcode", $("#barcodeval").text());	
});