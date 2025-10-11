pipeline {
    agent any

    environment {
        BACKEND_IMAGE = 'armmer/prodev-backend'
        FRONTEND_IMAGE = 'armmer/prodev-frontend'
    }

    stages {
        stage('Build Docker Images') {
            steps {
                echo "🔨 Building backend and frontend Docker images..."
                // backend จริงอยู่ที่ .\prodev
                bat "docker build -t %BACKEND_IMAGE% .\\prodev"
                // frontend จริงอยู่ที่ .\prodev-frontend\front-end
                bat "docker build -t %FRONTEND_IMAGE% .\\prodev-frontend\\front-end"
            }
        }

        stage('Start Containers') {
            steps {
                echo "🚀 Starting containers with docker-compose..."
                bat """
                docker-compose -f .\\docker-compose.yml up -d
                echo ⏳ Waiting for backend & frontend to start...
                timeout /t 30
                docker ps
                """
            }
        }

        stage('Run E2E Tests') {
            steps {
                dir('e2e') {
                    echo "🧪 Running Cypress end-to-end tests..."
                    bat """
                    npm ci
                    npx cypress run --headless --config baseUrl=http://host.docker.internal:3000
                    """
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub', usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_TOKEN')]) {
                    echo "📦 Pushing Docker images to Docker Hub..."
                    bat """
                    echo %DOCKERHUB_TOKEN% | docker login -u %DOCKERHUB_USER% --password-stdin
                    docker push %BACKEND_IMAGE%
                    docker push %FRONTEND_IMAGE%
                    docker logout
                    """
                }
            }
        }
    }

    post {
        always {
            echo "🧹 Cleaning up containers..."
            bat "docker-compose -f .\\docker-compose.yml down || exit 0"
        }
        success {
            echo '✅ Build, Test, and Push completed successfully!'
        }
        failure {
            echo '❌ Build or Test failed. Please check logs.'
        }
    }
}
