pipeline {
    agent any

    environment {
        AWS_REGION      = "us-east-1"
        AWS_ACCOUNT_ID  = "205091463760"
        ECR_REPOSITORY  = "vi-athena-frontend"
        IMAGE_TAG       = "${BUILD_NUMBER}"

        // Frontend Environment
        VITE_API_BASE_URL = "https://api.vs.lmsathena.com"
        VITE_ENV          = "production"
    }

    options {
        timestamps()
    }

    stages {

        stage('Checkout Source') {
            steps {
                checkout scm
            }
        }

        stage('Create Frontend Environment') {
            steps {
                sh '''
                cat > .env.production <<EOF
VITE_API_BASE_URL=${VITE_API_BASE_URL}
VITE_ENV=${VITE_ENV}
EOF

                echo "Generated .env.production"
                cat .env.production
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build React App') {
            steps {
                sh '''
                rm -rf dist || true
                npm run build
                '''
            }
        }

        stage('SonarQube Scan') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'

                    withSonarQubeEnv('Sonarqube') {
                        sh """
                        ${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=AthenaVI-Frontend \
                        -Dsonar.projectName=AthenaVI-Frontend \
                        -Dsonar.sources=src \
                        -Dsonar.sourceEncoding=UTF-8
                        """
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                docker build \
                --no-cache \
                -t ${ECR_REPOSITORY}:${IMAGE_TAG} .
                """
            }
        }

        stage('Trivy Scan') {
            steps {
                sh """
                trivy image \
                --scanners vuln \
                --severity HIGH,CRITICAL \
                --exit-code 0 \
                ${ECR_REPOSITORY}:${IMAGE_TAG}
                """
            }
        }

        stage('Login to Amazon ECR') {
            steps {
                sh """
                aws ecr get-login-password --region ${AWS_REGION} | \
                docker login \
                --username AWS \
                --password-stdin \
                ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                """
            }
        }

        stage('Push Docker Image') {
            steps {
                sh """
                docker tag ${ECR_REPOSITORY}:${IMAGE_TAG} \
                ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${IMAGE_TAG}

                docker tag ${ECR_REPOSITORY}:${IMAGE_TAG} \
                ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:latest

                docker push \
                ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${IMAGE_TAG}

                docker push \
                ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:latest
                """
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh """
                aws eks update-kubeconfig \
                    --region ${AWS_REGION} \
                    --name vi-athena-eks

                kubectl set image deployment/frontend \
                frontend=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${IMAGE_TAG}

                kubectl rollout status deployment/frontend --timeout=300s
                """
            }
        }
    }

    post {

        always {
            cleanWs()
        }

        success {
            echo "======================================="
            echo "Frontend Pipeline Completed Successfully"
            echo "Docker Image Built Successfully"
            echo "Docker Image Pushed to Amazon ECR"
            echo "Frontend Successfully Deployed to Amazon EKS"
            echo "======================================="
        }

        failure {
            echo "======================================="
            echo "Frontend Pipeline Failed"
            echo "======================================="
        }
    }
}
