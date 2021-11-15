#!/bin/sh

mkdir temp

cp . temp

pip install -r requirements.txt -t .

zip -r . layer.zip