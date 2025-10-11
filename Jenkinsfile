pipeline {
    agent any

    environment {
        BACKEND_IMAGE = 'armmer/prodev-backend'
        FRONTEND_IMAGE = 'armmer/prodev-frontend'
    }

    stages {
        stage('Build Docker Images') {
            steps {
                script {
                    echo "🔨 Building backend and frontend Docker images..."
                    // ตรวจสอบว่า Dockerfile อยู่ใน path ถูกต้อง
                    sh 'docker build -t $BACKEND_IMAGE ./prodev'
                    sh 'docker build -t $FRONTEND_IMAGE ./prodev-frontend/front-end'
                }
            }
        }

        stage('Start Containers') {
            steps {
                script {
                    echo "🚀 Starting containers with docker-compose..."
                    // ระบุ path docker-compose.yml ถ้าอยู่ root ของ workspace
                    sh '''
                    docker-compose -f ./docker-compose.yml up -d
                    echo "⏳ Waiting for backend & frontend to start..."
                    sleep 30
                    docker ps
                    '''
                }
            }
        }

        stage('Run E2E Tests') {
            steps {
                dir('e2e') { // เปลี่ยน directory ไปที่ e2e
                    echo "🧪 Running Cypress end-to-end tests..."
                    sh '''
                    npm ci
                    npx cypress run --headless --config baseUrl=http://host.docker.internal:3000
                    '''
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub', usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_TOKEN')]) {
                    script {
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
    }

    post {
        always {
            echo "🧹 Cleaning up containers..."
            sh 'docker-compose -f ./docker-compose.yml down || true'
        }
        success {
            echo '✅ Build, Test, and Push completed successfully!'
        }
        failure {
            echo '❌ Build or Test failed. Please check logs.'
        }
    }
}
