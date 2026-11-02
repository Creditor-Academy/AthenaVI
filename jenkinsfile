pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    sudo rsync -a --delete dist/ /var/www/AthenaVI/dist/
                    sudo nginx -t
                    sudo systemctl reload nginx
                '''
            }
        }
    }

    post {
        success {
            echo 'Frontend build and Nginx reload completed successfully.'
        }

        failure {
            echo 'Frontend pipeline failed.'
        }
    }
}
