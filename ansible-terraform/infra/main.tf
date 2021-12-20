#aws instance creation
resource "aws_instance" "os1" {
  ami           = "instance-image-id"
  instance_type = "t2.micro"
  security_groups =  [ "secret-group-name" ]
   key_name = "key-name-used-to-create-instance"
  tags = {
    Name = "TerraformOS"
  }
}
#ebs volume created
resource "aws_ebs_volume" "ebs"{
  availability_zone =  aws_instance.os1.availability_zone
  size              = 1
  tags = {
    Name = "myterraebs"
  }
}
#ebs volume attatched to instance
resource "aws_volume_attachment" "ebs_att" {
  device_name = "/dev/sdh"
  volume_id   = aws_ebs_volume.ebs.id
  instance_id = aws_instance.os1.id
  force_detach = true
}