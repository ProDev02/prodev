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
                sh 'docker build -t $BACKEND_IMAGE ./prodev'
                sh 'docker build -t $FRONTEND_IMAGE ./prodev-frontend/front-end'
            }
        }

        stage('Start Containers') {
            steps {
                echo "🚀 Starting containers with docker-compose..."
                sh '''
                docker-compose -f ./docker-compose.yml up -d
                docker ps
                '''
            }
        }

        stage('Run E2E Tests') {
            steps {
                dir('e2e') {
                    echo "🧪 Installing dependencies..."
                    sh 'npm ci'

                    echo "🧪 Running Cypress end-to-end tests..."
                    sh 'npx cypress run --headless --browser electron'
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub', usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_TOKEN')]) {
                    echo "📦 Pushing Docker images to Docker Hub..."
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

    post {
        always {
            echo "🧹 Cleaning up containers..."
            sh "docker-compose -f ./docker-compose.yml down || true"
            echo "🧹 Cleaning up workspace..."
            deleteDir()
        }
        success {
            echo '✅ Build, Test, and Push completed successfully!'
        }
        failure {
            echo '❌ Build or Test failed. Please check logs.'
        }
    }
}
