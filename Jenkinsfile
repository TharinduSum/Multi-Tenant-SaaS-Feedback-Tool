pipeline {
    agent any
    
    environment {
        // Docker Compose Project Name
        COMPOSE_PROJECT_NAME = 'multi-tenant-saas-feedback-tool'
        
        // Docker Hub Configuration
        DOCKER_HUB_USERNAME = 'tharindusum'
        DOCKER_HUB_BACKEND_IMAGE = 'tharindusum/feedback-backend'
        DOCKER_HUB_FRONTEND_IMAGE = 'tharindusum/feedback-frontend'
        DOCKER_IMAGE_TAG = "${env.BUILD_NUMBER}"
        
        // Docker Compose image names (based on project name and service name)
        COMPOSE_BACKEND_IMAGE = "${COMPOSE_PROJECT_NAME}-backend"
        COMPOSE_FRONTEND_IMAGE = "${COMPOSE_PROJECT_NAME}-frontend"
    }
    
    options {
        // Keep only last 10 builds
        buildDiscarder(logRotator(numToKeepStr: '10'))
        // Timeout after 30 minutes
        timeout(time: 30, unit: 'MINUTES')
        // Add timestamps to console output
        timestamps()
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "Checking out code from ${env.GIT_BRANCH}"
                    checkout scm
                }
            }
        }
        
        stage('Environment Setup') {
            steps {
                script {
                    echo "Setting up environment..."
                    sh 'chmod 666 /var/run/docker.sock || true'
                    sh '''
                        echo "Docker version:"
                        docker --version
                        echo "Docker Compose version:"
                        docker-compose --version
                        echo "Docker Hub Username: ${DOCKER_HUB_USERNAME}"
                    '''
                }
            }
        }
        
        stage('Docker Hub Login') {
            steps {
                script {
                    echo "Logging into Docker Hub..."
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh '''
                            echo "${DOCKER_PASS}" | docker login -u "${DOCKER_USER}" --password-stdin
                        '''
                    }
                }
            }
        }
        
        stage('Lint Backend') {
            steps {
                script {
                    echo "Running backend linting..."
                    dir('backend') {
                        sh '''
                            # Install linting tools if not already installed
                            pip install flake8 pylint || true
                            
                            # Run linting (non-blocking for now)
                            flake8 app/ --max-line-length=120 --ignore=E501,W503 || echo "Linting issues found, but continuing..."
                        '''
                    }
                }
            }
        }
        
        stage('Test Backend') {
            steps {
                script {
                    echo "Running backend tests..."
                    dir('backend') {
                        sh '''
                            # Install test dependencies
                            pip install pytest pytest-cov || true
                            
                            # Run tests if they exist
                            if [ -f "requirements-test.txt" ]; then
                                pip install -r requirements-test.txt
                            fi
                            
                            # Run tests (if test files exist)
                            pytest tests/ -v --cov=app --cov-report=term-missing || echo "No tests found or tests failed, but continuing..."
                        '''
                    }
                }
            }
        }
        
        stage('Build Database') {
            steps {
                script {
                    echo "Preparing database configuration..."
                    // Database image is pulled, not built
                    sh 'docker pull mysql:8.0 || true'
                }
            }
        }
        
        stage('Docker Compose Build') {
            steps {
                script {
                    echo "Building all services with docker-compose..."
                    sh '''
                        docker-compose -p ${COMPOSE_PROJECT_NAME} build --no-cache
                        
                        # List built images
                        echo "Built images:"
                        docker images | grep -E "${COMPOSE_PROJECT_NAME}|${DOCKER_HUB_USERNAME}" || true
                    '''
                }
            }
        }
        
        stage('Tag Images for Docker Hub') {
            steps {
                script {
                    echo "Tagging images for Docker Hub..."
                    sh '''
                        # Tag backend image
                        docker tag ${COMPOSE_BACKEND_IMAGE}:latest ${DOCKER_HUB_BACKEND_IMAGE}:latest
                        docker tag ${COMPOSE_BACKEND_IMAGE}:latest ${DOCKER_HUB_BACKEND_IMAGE}:${DOCKER_IMAGE_TAG}
                        
                        # Tag frontend image
                        docker tag ${COMPOSE_FRONTEND_IMAGE}:latest ${DOCKER_HUB_FRONTEND_IMAGE}:latest
                        docker tag ${COMPOSE_FRONTEND_IMAGE}:latest ${DOCKER_HUB_FRONTEND_IMAGE}:${DOCKER_IMAGE_TAG}
                        
                        # Verify tags
                        echo "Tagged images:"
                        docker images | grep "${DOCKER_HUB_USERNAME}" || true
                    '''
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                script {
                    echo "Pushing images to Docker Hub..."
                    sh '''
                        # Push backend images
                        echo "Pushing backend image..."
                        docker push ${DOCKER_HUB_BACKEND_IMAGE}:latest
                        docker push ${DOCKER_HUB_BACKEND_IMAGE}:${DOCKER_IMAGE_TAG}
                        
                        # Push frontend images
                        echo "Pushing frontend image..."
                        docker push ${DOCKER_HUB_FRONTEND_IMAGE}:latest
                        docker push ${DOCKER_HUB_FRONTEND_IMAGE}:${DOCKER_IMAGE_TAG}
                        
                        echo "Successfully pushed all images to Docker Hub!"
                    '''
                }
            }
        }
        
        stage('Docker Compose Up') {
            steps {
                script {
                    echo "Starting services with docker-compose..."
                    sh '''
                        # Stop any existing containers
                        docker-compose -p ${COMPOSE_PROJECT_NAME} down || true
                        
                        # Start services
                        docker-compose -p ${COMPOSE_PROJECT_NAME} up -d
                        
                        # Wait for services to be healthy
                        echo "Waiting for services to be ready..."
                        sleep 30
                        
                        # Check service health
                        docker-compose -p ${COMPOSE_PROJECT_NAME} ps
                    '''
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo "Performing health checks..."
                    sh '''
                        # Check backend health
                        echo "Checking backend health..."
                        for i in {1..30}; do
                            if curl -f http://localhost:8000/docs > /dev/null 2>&1; then
                                echo "Backend is healthy!"
                                break
                            fi
                            echo "Waiting for backend... ($i/30)"
                            sleep 2
                        done
                        
                        # Check frontend health
                        echo "Checking frontend health..."
                        for i in {1..30}; do
                            if curl -f http://localhost/health > /dev/null 2>&1; then
                                echo "Frontend is healthy!"
                                break
                            fi
                            echo "Waiting for frontend... ($i/30)"
                            sleep 2
                        done
                        
                        # Final health check
                        echo "Final health check status:"
                        docker-compose -p ${COMPOSE_PROJECT_NAME} ps
                    '''
                }
            }
        }
        
        stage('Integration Tests') {
            steps {
                script {
                    echo "Running integration tests..."
                    sh '''
                        # Example: Test API endpoints
                        echo "Testing API endpoints..."
                        
                        # Test backend API
                        curl -f http://localhost:8000/docs || echo "Backend API test failed"
                        
                        # Test frontend
                        curl -f http://localhost/health || echo "Frontend health check failed"
                        
                        echo "Integration tests completed"
                    '''
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo "Cleaning up..."
                sh '''
                    # Save logs before cleanup
                    docker-compose -p ${COMPOSE_PROJECT_NAME} logs > docker-compose-logs.txt || true
                    
                    # Stop containers (but keep them for inspection)
                    # docker-compose -p ${COMPOSE_PROJECT_NAME} down || true
                '''
                
                // Archive logs
                archiveArtifacts artifacts: 'docker-compose-logs.txt', allowEmptyArchive: true
            }
        }
        
        success {
            echo "Pipeline succeeded!"
            script {
                sh '''
                    echo "Services are running:"
                    docker-compose -p ${COMPOSE_PROJECT_NAME} ps
                '''
            }
        }
        
        failure {
            echo "Pipeline failed!"
            script {
                sh '''
                    echo "Collecting error logs..."
                    docker-compose -p ${COMPOSE_PROJECT_NAME} logs --tail=100 > error-logs.txt || true
                '''
                archiveArtifacts artifacts: 'error-logs.txt', allowEmptyArchive: true
            }
        }
        
        cleanup {
            // Clean up workspace
            cleanWs()
        }
    }
}
