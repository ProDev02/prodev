pipeline {
    agent any

    environment {
        BACKEND_IMAGE = 'armmer/prodev-backend'
        FRONTEND_IMAGE = 'armmer/prodev-frontend'
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/ProDev02/prodev.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                echo "🔨 Building backend and frontend Docker images..."
                // ใช้ bat แทน sh สำหรับ Windows
                bat "docker build -t %BACKEND_IMAGE% .\\prodev"
                bat "docker build -t %FRONTEND_IMAGE% .\\prodev-frontend\\front-end"
            }
        }

        stage('Start Containers') {
            steps {
                echo "🚀 Starting containers with docker-compose..."
                bat """
                docker-compose up -d
                timeout /t 25
                docker ps
                """
            }
        }

        stage('Run E2E Tests') {
            steps {
                echo "🧪 Running Cypress end-to-end tests..."
                bat """
                cd e2e
                npm ci
                npx cypress run --headless --config baseUrl=http://localhost:3000
                """
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo "📦 Pushing Docker images to Docker Hub..."
                withCredentials([usernamePassword(credentialsId: 'docker-hub', usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_TOKEN')]) {
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
            bat "docker-compose down || exit 0"
        }
        success {
            echo '✅ Build, Test, and Push completed successfully!'
        }
        failure {
            echo '❌ Build or Test failed. Please check logs.'
        }
    }
}
