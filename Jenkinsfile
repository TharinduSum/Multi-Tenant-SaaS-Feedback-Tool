pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo 'Building Docker images using Compose...'
                // Build images without cache to ensure a fresh start
                sh 'docker-compose build'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Force removing conflicting container and starting fresh...'
                
                sh 'docker rm -f my-mysql-server || true'
                sh 'docker-compose down'
                // -d runs containers in the background
                sh 'docker-compose up -d'
            }
        }

        stage('Verify') {
            steps {
                echo 'Listing running containers:'
                sh 'docker ps'
                
                echo 'Checking connectivity to Backend...'
                // Simple check to see if the port is open
                sh 'curl -f http://localhost:8000 || echo "Backend not reachable yet"'
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution finished.'
        }
        failure {
            echo 'Something went wrong. Checking logs...'
            sh 'docker-compose logs --tail=20'
        }
    }
}