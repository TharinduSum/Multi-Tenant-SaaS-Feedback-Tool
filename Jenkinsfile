pipeline {
    agent any

    environment {
        // Docker Hub account identification
        DOCKER_HUB_USER = 'tharindusum'
        FRONTEND_REPO   = 'feedback-frontend'
        BACKEND_REPO    = 'feedback-backend'
        
        // The ID of the credentials you created in the Jenkins UI
        DOCKER_HUB_CREDS_ID = 'docker-hub-credentials'
        
        // Explicitly defining the PATH to ensure Jenkins can find the 'docker' command on macOS
        PATH = "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
    }

    stages {
        stage('Checkout Source Code') {
            steps {
                // Pulls the latest code from the GitHub repository configured in the Job
                checkout scm
            }
        }

        stage('Build & Push Frontend') {
            steps {
                script {
                    // 1. Build the frontend image using the Dockerfile in the /frontend directory
                    // Tags it with 'latest' and the specific Jenkins Build Number
                    sh "docker build -t ${DOCKER_HUB_USER}/${FRONTEND_REPO}:latest -t ${DOCKER_HUB_USER}/${FRONTEND_REPO}:${env.BUILD_NUMBER} ./frontend"
                    
                    // 2. Authenticate and push to Docker Hub
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_HUB_CREDS_ID}", passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                        // Securely log in using the credentials defined in environment
                        sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"
                        
                        // Push both tags to the repository
                        sh "docker push ${DOCKER_HUB_USER}/${FRONTEND_REPO}:latest"
                        sh "docker push ${DOCKER_HUB_USER}/${FRONTEND_REPO}:${env.BUILD_NUMBER}"
                    }
                }
            }
        }

        stage('Build & Push Backend') {
            steps {
                script {
                    // 1. Build the backend image using the Dockerfile in the /backend directory
                    sh "docker build -t ${DOCKER_HUB_USER}/${BACKEND_REPO}:latest -t ${DOCKER_HUB_USER}/${BACKEND_REPO}:${env.BUILD_NUMBER} ./backend"
                    
                    // 2. Push to Docker Hub (Login is already active from the previous stage)
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_HUB_CREDS_ID}", passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                        sh "docker push ${DOCKER_HUB_USER}/${BACKEND_REPO}:latest"
                        sh "docker push ${DOCKER_HUB_USER}/${BACKEND_REPO}:${env.BUILD_NUMBER}"
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                // Cleanup: Delete local images to prevent your MacBook's disk from filling up
                // '|| true' ensures the pipeline finishes even if an image was already deleted
                sh "docker rmi ${DOCKER_HUB_USER}/${FRONTEND_REPO}:latest ${DOCKER_HUB_USER}/${FRONTEND_REPO}:${env.BUILD_NUMBER} || true"
                sh "docker rmi ${DOCKER_HUB_USER}/${BACKEND_REPO}:latest ${DOCKER_HUB_USER}/${BACKEND_REPO}:${env.BUILD_NUMBER} || true"
            }
            // Cleans up the temporary workspace folder
            cleanWs()
        }
        success {
            echo 'SUCCESS: Both images were successfully pushed to Docker Hub.'
        }
        failure {
            echo 'FAILURE: The pipeline failed. Check the console output for specific errors.'
        }
    }
}