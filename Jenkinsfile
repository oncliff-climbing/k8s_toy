pipeline {
    agent any
    environment {
      // 환경 변수 설정
      GIT_REPO = 'https://github.com/kakaojungwoo/k8s_toy.git'
    }
    stages {
        stage ('git master branch update') {
          steps {
            git url: "${env.GIT_REPO}", branch: 'master'
          }
        }
        stage ('docker app build and push') {
          steps {
            sh '''
            cd /var/lib/jenkins/k8s_toy
            docker build -t oncliff/k8s-toy:app1 .
            docker push oncliff/k8s-toy:app1 
            '''
          }
        }
        stage ('docker DB build and push') {
          steps {
            sh '''
            cd /var/lib/jenkins/k8s_toy/web_db
            docker build -t oncliff/k8s-toy:db .
            docker push oncliff/k8s-toy:db 
            '''
          }
        }
        stage('app deploy kubernetes') {
          steps {
            script {
            sh '''
            ansible manager -m shell -b -a "cd /root/k8s"
            ansible manager -m shell -b -a "rm -rf /root/k8s/k8s-deploy.yaml"
            ansible manager -m get_url -a "url=https://github.com/kakaojungwoo/k8s_toy/raw/master/k8s-deploy.yaml dest=/root/k8s/k8s-deploy.yaml"
            sleep 10
            ansible manager -m command -b -a "kubectl apply -f /root/k8s/k8s-deploy.yaml"
            '''
            }
          }  
        } 
        stage('deploy sucess') {
          steps {
            sh '''
            ansible manager -m command -b -a "kubectl get pod -n k8s-toy -o wide"
            ansible manager -m command -b -a "kubectl get svc -n k8s-toy -o wide"
            '''
            }
          }  
        } 
    }
    // triggers {
    //     // GitHub 저장소에 새 커밋이 푸시될 때마다 트리거
    //     pollSCM('H/5 * * * *') // 5분마다 SCM polling
    //     // Jenkins에서 crontab 형식으로 스케줄링

    post {
      success {
        echo "deploy success"
        // 배포가 성공하면 실행할 액션
        }
        failure {
        echo "deploy failure"
        // 배포가 실패하면 실행할 액션
        }
    }     
