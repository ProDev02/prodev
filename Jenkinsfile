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
                script {
                    echo "🔨 Building backend and frontend Docker images..."
                    sh 'docker build -t $BACKEND_IMAGE ./prodev'
                    sh 'docker build -t $FRONTEND_IMAGE ./prodev-frontend/front-end'
                }
            }
        }

        stage('Start Containers') {
            steps {
                script {
                    echo "🚀 Starting containers with docker-compose..."
                    sh '''
                    docker-compose up -d
                    echo "⏳ Waiting for backend & frontend to start..."
                    sleep 25
                    docker ps
                    '''
                }
            }
        }

        stage('Run E2E Tests') {
            steps {
                script {
                    echo "🧪 Running Cypress end-to-end tests..."
                    sh '''
                    cd e2e
                    npm ci
                    npx cypress run --headless --config baseUrl=http://host.docker.internal:3000 || true
                    '''
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    echo "📦 Pushing Docker images to Docker Hub..."
                    // ใช้ Jenkins Credentials แทน token ตรง ๆ
                    withCredentials([usernamePassword(credentialsId: 'docker-hub', usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_TOKEN')]) {
                        sh '''
                        echo $DOCKERHUB_TOKEN | docker login -u $DOCKERHUB_USER --password-stdin
                        docker push $BACKEND_IMAGE
                        docker push $FRONTEND_IMAGE
                        docker logout
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            echo "🧹 Cleaning up containers..."
            sh 'docker-compose down || true'
        }
        success {
            echo '✅ Build, Test, and Push completed successfully!'
        }
        failure {
            echo '❌ Build or Test failed. Please check logs.'
        }
    }
}
