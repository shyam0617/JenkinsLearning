// ---- Jenkinsfile: the pipeline definition ----
// Jenkins reads this from your GitHub repo and runs each stage in order.
// You'll see these stages light up green in the Jenkins UI (Stage View).

pipeline {
    agent any

    environment {
        IMAGE_NAME     = 'jenkins-demo'
        IMAGE_TAG      = "${BUILD_NUMBER}"   // each run gets a unique number
        CONTAINER_NAME = 'jenkins-demo'
        APP_PORT       = '3000'
    }

    stages {

        stage('Checkout') {
            steps {
                echo '📥 Getting the latest code from Git...'
                checkout scm
            }
        }

        stage('Install') {
            steps {
                echo '📦 Installing dependencies...'
                sh 'node --version'
                sh 'npm ci'
            }
        }

        stage('Test') {
            // This is STRICT: if a test fails, the pipeline stops here and never
            // deploys broken code. That is the whole point of CI.
            steps {
                echo '🧪 Running tests...'
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "🐳 Building image ${IMAGE_NAME}:${IMAGE_TAG}..."
                sh 'docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest .'
            }
        }

        stage('Deploy') {
            steps {
                echo '🚀 Deploying the new container...'
                sh '''
                    docker rm -f ${CONTAINER_NAME} || true
                    docker run -d \
                        --name ${CONTAINER_NAME} \
                        -p ${APP_PORT}:${APP_PORT} \
                        ${IMAGE_NAME}:latest
                '''
                echo "✅ App is live at http://localhost:${APP_PORT}"
            }
        }
    }

    post {
        success { echo '🎉 Pipeline succeeded!' }
        failure { echo '❌ Pipeline failed — read the stage logs above.' }
    }
}
