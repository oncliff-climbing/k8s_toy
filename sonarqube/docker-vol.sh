#!/bin/bash

docker volume create sonarqube_data
docker volume create sonarqube_extensions
docker volume create sonarqube_logs
docker volume create postgresql
docker volume create postgresql_data
