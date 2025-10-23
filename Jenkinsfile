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
                bat 'docker build -t %BACKEND_IMAGE% .\\prodev'
                bat 'docker build -t %FRONTEND_IMAGE% .\\prodev-frontend\\front-end'
            }
        }

        stage('Start Containers') {
            steps {
                echo "🚀 Starting containers..."

                // Start the MySQL container
                bat 'docker run -d --name prodev_db -e MYSQL_ROOT_PASSWORD=ict555!!! -e MYSQL_DATABASE=prodev_db -p 3307:3306 -v prodev_db_data:/var/lib/mysql -v ./mysql-init:/docker-entrypoint-initdb.d mysql:8.0'

                // Start the backend container
                bat 'docker run -d --name backend -e SPRING_DATASOURCE_URL=jdbc:mysql://prodev_db:3306/prodev_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC -e SPRING_DATASOURCE_USERNAME=root -e SPRING_DATASOURCE_PASSWORD=ict555!!! -e JWT_EXPIRATION=86400000 -e UPLOAD_DIR=uploads/products -v ./prodev/uploads/products:/uploads/products -v ./prodev/uploads/products:/app/uploads/products -p 8080:8080 --link prodev_db:prodev_db %BACKEND_IMAGE%'

                // Start the frontend container
                bat 'docker run -d --name frontend -p 3000:3000 --link backend:backend %FRONTEND_IMAGE%'
            }
        }

        stage('Run E2E Tests') {
            steps {
                dir('e2e') {
                    echo "🧪 Installing dependencies..."
                    bat 'npm ci'

                    echo "🧪 Running Cypress end-to-end tests..."
                    bat 'npx cypress run --headless --browser electron --config baseUrl=http://localhost:3000'
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
            bat """
            docker stop frontend backend prodev_db
            docker rm frontend backend prodev_db
            """
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
