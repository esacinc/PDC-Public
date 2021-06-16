FROM python:3.7
# Create user
RUN useradd --create-home -s /bin/bash user
RUN usermod -aG sudo user
#Create virtual environment
RUN python3 -m venv /opt/venv
# Create app directory
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN apt-get update
# Install dependencies from requirements.txt
RUN . /opt/venv/bin/activate && pip install -r requirements.txt
# Environment variables
ENV IS_DOCKER true
ENV S3_WRITE_ACCESS_KEY <Enter Access Key>
ENV S3_WRITE_SECRET_KEY <Enter Secret Key>

# Expose the port
EXPOSE 5000
CMD . /opt/venv/bin/activate && exec python server.py

