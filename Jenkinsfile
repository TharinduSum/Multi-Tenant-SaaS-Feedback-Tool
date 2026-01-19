pipeline {
    agent any

    environment {
        // Docker Hub account details
        DOCKER_HUB_USER = 'tharindusum'
        FRONTEND_REPO   = 'feedback-frontend'
        BACKEND_REPO    = 'feedback-backend'
        
        // The ID of the credentials you created in Jenkins
        DOCKER_HUB_CREDS_ID = 'docker-hub-credentials'
        PATH = "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
    }

    stages {
        stage('Checkout') {
            steps {
                // Pull the latest code from your Git repository
                checkout scm
            }
        }

        stage('Build & Push Frontend') {
            steps {
                script {
                    // Build the Docker image using the Dockerfile inside the './frontend' directory
                    // The image is tagged as 'latest' by default here
                    def frontendImg = docker.build("${DOCKER_HUB_USER}/${FRONTEND_REPO}:latest", "./frontend")
                    
                    // Log in to Docker Hub and push the image
                    docker.withRegistry('', DOCKER_HUB_CREDS_ID) {
                        // Push the 'latest' version
                        frontendImg.push()
                        // Also push a version tagged with the Jenkins Build Number for history
                        frontendImg.push("${env.BUILD_NUMBER}")
                    }
                }
            }
        }

        stage('Build & Push Backend') {
            steps {
                script {
                    // Build the Docker image using the Dockerfile inside the './backend' directory
                    def backendImg = docker.build("${DOCKER_HUB_USER}/${BACKEND_REPO}:latest", "./backend")
                    
                    // Log in to Docker Hub and push the image
                    docker.withRegistry('', DOCKER_HUB_CREDS_ID) {
                        // Push the 'latest' version
                        backendImg.push()
                        // Also push a version tagged with the Jenkins Build Number
                        backendImg.push("${env.BUILD_NUMBER}")
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                // Remove local images after pushing to save disk space on the Jenkins server
                // The '|| true' ensures the pipeline doesn't fail if the image was already removed
                sh "docker rmi ${DOCKER_HUB_USER}/${FRONTEND_REPO}:latest ${DOCKER_HUB_USER}/${FRONTEND_REPO}:${env.BUILD_NUMBER} || true"
                sh "docker rmi ${DOCKER_HUB_USER}/${BACKEND_REPO}:latest ${DOCKER_HUB_USER}/${BACKEND_REPO}:${env.BUILD_NUMBER} || true"
            }
            // Clean up the workspace files
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully: Images pushed to Docker Hub.'
        }
        failure {
            echo 'Pipeline failed: Please check the logs above for errors.'
        }
    }
}