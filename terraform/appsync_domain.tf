resource "aws_appsync_domain_name" "main" {
  domain_name     = var.domain_name
  certificate_arn = aws_acm_certificate_validation.appsync.certificate_arn

  depends_on = [aws_acm_certificate_validation.appsync]
}

resource "aws_appsync_domain_name_api_association" "main" {
  api_id      = aws_appsync_graphql_api.main.id
  domain_name = aws_appsync_domain_name.main.domain_name
}

resource "aws_route53_record" "appsync" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "CNAME"
  ttl     = 300
  records = [aws_appsync_domain_name.main.appsync_domain_name]
}