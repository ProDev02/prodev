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
                docker ps
                """
            }
        }

        stage('Wait Database Ready') {
            steps {
                echo "⏳ Waiting for MySQL to be ready..."
                powershell '''
                $dbReady = $false
                for ($i=1; $i -le 30; $i++) {
                    try {
                        $result = docker exec prodev_db mysqladmin ping -uroot -pict555!!! 2>&1
                        if ($result -match "mysqld is alive") {
                            Write-Host "✅ MySQL is ready!"
                            $dbReady = $true
                            break
                        }
                    } catch {}
                    Start-Sleep -Seconds 5
                }
                if (-not $dbReady) { Write-Host "❌ MySQL did not start in time"; exit 1 }
                '''
            }
        }

        stage('Wait Backend Ready') {
            steps {
                echo "⏳ Waiting for backend to open port 8080..."
                powershell '''
                $backendReady = $false
                for ($i=1; $i -le 30; $i++) {
                    try {
                        $tcp = New-Object System.Net.Sockets.TcpClient('localhost', 8080)
                        if ($tcp.Connected) {
                            Write-Host "✅ Backend port 8080 is open!"
                            $backendReady = $true
                            $tcp.Close()
                            break
                        }
                    } catch {}
                    Start-Sleep -Seconds 5
                }
                if (-not $backendReady) { Write-Host "❌ Backend did not start in time"; exit 1 }
                '''
            }
        }

        stage('Show Backend Logs') {
            steps {
                echo "📄 Showing backend logs (last 100 lines)..."
                bat 'docker logs --tail 100 pipeline-backend-1'
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
