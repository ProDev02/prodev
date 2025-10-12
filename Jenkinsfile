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
                echo "🚀 Starting containers with docker-compose..."
                bat """
                docker-compose -f .\\docker-compose.yml up -d
                echo Waiting for containers to start...
                powershell -Command "Start-Sleep -Seconds 30"
                docker ps
                """
            }
        }

        stage('Check Database') {
            steps {
                echo "🗄 Checking if database is ready..."
                powershell """
                \$retries = 12
                do {
                    Write-Host "Checking database..."
                    try {
                        docker exec prodev_db mysql -uroot -pict555!!! -D prodev_db -e "SHOW TABLES;" | Out-Null
                        \$ready = \$true
                    } catch {
                        Write-Host "Database not ready, retrying in 5s..."
                        Start-Sleep -Seconds 5
                        \$retries--
                        \$ready = \$false
                    }
                } until (\$ready -or \$retries -le 0)

                if (-not \$ready) {
                    Write-Error "Database not ready after multiple retries"
                    exit 1
                }
                """
            }
        }

        stage('Wait for Backend') {
            steps {
                echo "⏳ Waiting for backend to be ready..."
                powershell """
                \$retries = 20
                do {
                    try {
                        Invoke-WebRequest -Uri http://host.docker.internal:8080/actuator/health -UseBasicParsing | Out-Null
                        \$ready = \$true
                    } catch {
                        Write-Host "Backend not ready, retrying in 5s..."
                        Start-Sleep -Seconds 5
                        \$retries--
                        \$ready = \$false
                    }
                } until (\$ready -or \$retries -le 0)

                if (-not \$ready) {
                    Write-Error "Backend not ready after multiple retries"
                    exit 1
                }
                """
            }
        }

        stage('Run E2E Tests') {
            steps {
                dir('e2e') {
                    echo "🧪 Installing dependencies..."
                    bat 'npm ci'

                    echo "🧪 Running Cypress end-to-end tests..."
                    bat 'npx cypress run --headless --browser chrome --config baseUrl=http://localhost:3000'
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
