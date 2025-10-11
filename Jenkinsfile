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
                    sh 'docker build -t $BACKEND_IMAGE ./prodev'
                    sh 'docker build -t $FRONTEND_IMAGE ./prodev-frontend/front-end'
                }
            }
        }

        stage('Start Containers') {
            steps {
                script {
                    sh '''
                    docker-compose up -d
                    sleep 30
                    docker ps
                    '''
                }
            }
        }

        stage('Run E2E Tests') {
            steps {
                dir('e2e') {
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
            node {
                sh 'docker-compose down || true'
            }
        }
    }
}
