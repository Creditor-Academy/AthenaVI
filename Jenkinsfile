pipeline {
    agent any

    environment {
        AWS_REGION      = "us-east-1"
        AWS_ACCOUNT_ID  = "205091463760"
        ECR_REPOSITORY  = "vi-athena-frontend"
        IMAGE_TAG       = "${BUILD_NUMBER}"

        // Frontend Environment Variables
        VITE_API_BASE_URL = "https://api.vs.lmsathena.com"
        VITE_ENV = "production"
    }

    options {
        timestamps()
        skipDefaultCheckout(true)
    }

    stages {

        stage('Checkout Source') {
            steps {
                checkout scm
            }
        }

        stage('Create Frontend Environment') {
            steps {
                writeFile file: '.env.production', text: """
VITE_API_BASE_URL=${env.VITE_API_BASE_URL}
VITE_ENV=${env.VITE_ENV}
"""
                sh '''
                echo "==================================="
                echo "Generated .env.production"
                echo "==================================="
                cat .env.production
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                set -e
                npm ci
                '''
            }
        }

        stage('Build React App') {
            steps {
                sh '''
                set -e

                echo "===================================="
                echo "Building React Application"
                echo "===================================="

                rm -rf dist

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
                set -e

                docker build \
                --no-cache \
                -t ${ECR_REPOSITORY}:${IMAGE_TAG} .
                """
            }
        }

        stage('Trivy Scan') {
            steps {
                sh """
                set -e

                rm -rf ~/.cache/trivy/db

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
                set -e

                aws ecr get-login-password \
                --region ${AWS_REGION} | docker login \
                --username AWS \
                --password-stdin \
                ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                """
            }
        }

        stage('Push Docker Image') {
            steps {
                sh """
                set -e

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

        stage('Deploy to Amazon EKS') {
            steps {
                sh """
                set -e

                aws eks update-kubeconfig \
                  --region ${AWS_REGION} \
                  --name vi-athena-eks

                kubectl set image deployment/frontend \
                frontend=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${IMAGE_TAG}

                kubectl rollout status deployment/frontend --timeout=300s

                echo ""
                echo "========== Running Pods =========="
                kubectl get pods

                echo ""
                echo "========== Deployments =========="
                kubectl get deployment

                echo ""
                echo "========== Services =========="
                kubectl get svc

                echo ""
                echo "========== Rollout History =========="
                kubectl rollout history deployment/frontend

                echo ""
                echo "========== Current Image =========="
                kubectl get deployment frontend \
                -o=jsonpath='{.spec.template.spec.containers[0].image}'

                echo ""
                """
            }
        }
    }

    post {

        always {
            sh 'docker system prune -af'
            cleanWs()
        }

        success {

            echo "========================================"
            echo "Frontend CI/CD Pipeline Completed Successfully"
            echo "Environment File Generated Successfully"
            echo "React Application Built Successfully"
            echo "Docker Image Built Successfully"
            echo "Docker Image Pushed to Amazon ECR"
            echo "Frontend Successfully Deployed to Amazon EKS"
            echo "========================================"
        }

        failure {

            echo "========================================"
            echo "Frontend CI/CD Pipeline Failed"
            echo "========================================"
        }
    }
}
