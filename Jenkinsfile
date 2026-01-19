pipeline {
    agent any

    environment {
        
        DOCKER_HUB_USER = 'tharindusum'
        FRONTEND_REPO   = 'feedback-frontend'
        BACKEND_REPO    = 'feedback-backend'
        
        
        DOCKER_HUB_CREDS_ID = 'docker-hub-credentials'
    }

    stages {
        stage('Checkout') {
            steps {
                
                checkout scm
            }
        }

        stage('Build & Push Frontend') {
            steps {
                script {
                    
                    def frontendImg = docker.build("${DOCKER_HUB_USER}/${FRONTEND_REPO}:latest", "./frontend")
                    
                    docker.withRegistry('', DOCKER_HUB_CREDS_ID) {
                        
                        frontendImg.push()
                        
                        frontendImg.push("${env.BUILD_NUMBER}")
                    }
                }
            }
        }

        stage('Build & Push Backend') {
            steps {
                script {
                    
                    def backendImg = docker.build("${DOCKER_HUB_USER}/${BACKEND_REPO}:latest", "./backend")
                    
                    docker.withRegistry('', DOCKER_HUB_CREDS_ID) {
                        
                        backendImg.push()
                        
                        backendImg.push("${env.BUILD_NUMBER}")
                    }
                }
            }
        }
    }

    post {
        always {
            script {
            
                sh "docker rmi ${DOCKER_HUB_USER}/${FRONTEND_REPO}:latest ${DOCKER_HUB_USER}/${FRONTEND_REPO}:${env.BUILD_NUMBER} || true"
                sh "docker rmi ${DOCKER_HUB_USER}/${BACKEND_REPO}:latest ${DOCKER_HUB_USER}/${BACKEND_REPO}:${env.BUILD_NUMBER} || true"
            }
            
            cleanWs()
        }
        success {
            echo 'Docker Images successfully pushed to Docker Hub!'
        }
        failure {
            echo 'Pipeline failed. Please check the logs.'
        }
    }
}