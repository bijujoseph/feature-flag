provider "aws" {
  region = "us-east-1"
}

terraform {
  backend "s3" {
    bucket = "tfstate-store-bj"
    encrypt = true
    key = "terraform.tfstate"
    region = "us-east-1"
    dynamodb_table = "terraform-state-lock-dynamo"
  }
}

resource "aws_dynamodb_table" "dynamodb-terraform-state-lock" {
  name = "terraform-state-lock-dynamo"
  hash_key = "LockID"
  read_capacity = 20
  write_capacity = 20
  attribute {
    name = "LockID"
    type = "S"
  }
  tags = {
    Name = "tfstate-store-bj Terraform State Lock Table"
  }
}

resource "aws_iam_role" "ff_exec_role" {
  name = "ff_exec_role"
  assume_role_policy = "${file("iam/ff_lambda_assume_role.json")}"
}


resource "aws_iam_role_policy" "ff_policy" {
  name = "ff_policy"
  role = aws_iam_role.ff_exec_role.id
  policy = "${file("iam/ff_lambda_cloudwatch_policy.json")}"
}

resource "aws_lambda_function" "ff_lambda" {
  function_name = "ff"
  handler = "index.handler"
  runtime = "nodejs12.x"
  filename = "ff.zip"
  source_code_hash = "${filebase64sha256("ff.zip")}"
  role = "${aws_iam_role.ff_exec_role.arn}"
}