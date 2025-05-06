# O Projeto

O projeto é um aplicativo de chat que integra funcionalidades de mensagens em tempo real com análise de notícias financeiras. Utiliza-se o Firebase para autenticação de usuários e gerenciamento de dados, enquanto a análise de sentimentos das notícias é realizada por meio de modelos de aprendizado de máquina, como o FinBERT-PT-BR. O aplicativo é desenvolvido em React Native com EXPO, permitindo que os usuários interajam com um bot e entre si em um ambiente de chat.

## Funcionalidades do Aplicativo
Autenticação de Usuários: Os usuários podem se cadastrar e fazer login utilizando e-mail e senha, com suporte para login via Google.
Mensagens em Tempo Real: Utiliza o GiftedChat para gerenciar e exibir mensagens em tempo real, permitindo que os usuários enviem e recebam mensagens instantaneamente.
Análise de Notícias: O aplicativo busca e analisa notícias financeiras, utilizando o modelo FinBERT-PT-BR para determinar o sentimento das notícias (positivo, negativo ou neutro).
Exibição de Resultados: Os resultados da análise de sentimentos são estruturados em JSON e apresentados aos usuários, permitindo que eles vejam a interpretação das notícias e seu impacto.

## Utilização do Processo
Cadastro e Login: O usuário se cadastra no aplicativo e faz login. As informações são armazenadas no Firestore.
Interação no Chat: Os usuários podem interagir no chat, enviando mensagens e recebendo respostas do bot.
Análise de Notícias: O aplicativo busca notícias financeiras e as envia para a API para análise.
Processamento com FinBERT: A API utiliza o modelo FinBERT-PT-BR para analisar o sentimento das notícias.
Estruturação do Retorno: O resultado da análise é estruturado em JSON pelo modelo Lhama 1b, que organiza as informações de forma que possam ser facilmente consumidas pelo aplicativo.
Exibição dos Resultados: Os resultados da análise são exibidos no aplicativo, permitindo que os usuários vejam a interpretação das notícias e seu impacto.

## Infraestrutura e Tecnologias Utilizadas
Flask API: A API é construída utilizando Flask, um microframework para Python que facilita a criação de APIs RESTful. A API é responsável por receber as solicitações do aplicativo, processar as análises e retornar os resultados.
PostgreSQL: O banco de dados relacional PostgreSQL é utilizado para armazenar dados de usuários, mensagens e outras informações relevantes, garantindo integridade e eficiência no gerenciamento de dados.
Docker: O servidor da API é executado em um ambiente Docker, permitindo que a aplicação seja facilmente implantada e escalável. O uso de Docker em um computador de baixo custo possibilita a execução dos modelos de análise de forma eficiente, sem a necessidade de infraestrutura cara.
Modelos de Análise
FinBERT-PT-BR: Um modelo de aprendizado de máquina treinado para análise de sentimentos em textos financeiros em português. Ele classifica as notícias como positivas, negativas ou neutras, ajudando os usuários a entenderem o sentimento do mercado.
Lhama 1b: Um modelo que estrutura o retorno da análise do FinBERT em um formato JSON. Isso permite que os dados sejam facilmente integrados e utilizados dentro do aplicativo, proporcionando uma experiência de usuário mais fluida.

O projeto combina a funcionalidade de um aplicativo de chat com a análise de sentimentos de notícias financeiras, utilizando tecnologias modernas como Firebase, React Native, Flask, PostgreSQL e Docker. Isso resulta em uma ferramenta poderosa para usuários que desejam se manter informados sobre o mercado financeiro e interagir em um ambiente de chat dinâmico, tudo isso rodando em um servidor de baixo custo o que não permitiu mais avanços por conta de custo computacional e desempenho. Para melhor aproveitamento do APP, deve-se ser hospedado a API em um servidor como AWS, AZURE, CGP.
