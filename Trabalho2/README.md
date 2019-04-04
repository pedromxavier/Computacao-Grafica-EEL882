# Computa&ccedil;&atilde;o Gr&aacute;fica [EEL882]
## Pedro Maciel Xavier [DRE: 116023847]
### Trabalho II - Ray casting em 2D

Instruções:

```
O Menu possui 5 botões:
  1 Criar Formas: Nesse Modo, o primeiro click inicia a criação de uma forma, e os clicks subsequentes definem novos vértices. Há três maneiras de concluir a criação da forma:
    1.1 Duplo click: Termina a forma criando um novo ponto e ligando este ao primeiro.
    1.2 Tecla Enter: Termina a forma simplesmesnte ligando o último ponto criado ao primeiro de todos.
    1.3 Tecla Escape: Cancela a criação da forma.
      
  2 Criar Raios: Aqui, o primeiro click define a origem do raio, e o segundo define a direção e sentido de propagação deste. Temos aqui duas opções:
    2.1 Click Simples: Define a direção e sentido do raio.
    2.2 Tecla Escape: Cancela a criação do raio.
      
  3 Modo Edição: Nesse modo, pode-se editar as figuras criadas:
    3.1 Formas: Basta clicar no interior de uma forma e, segurando o botão esquerdo, arrastar a forma por aí. Em caso de superposição, seleciona-se naturalmente aquela que se encontra por cima das demais.
    3.2 Vértices das Formas: Ao entrar no Modo Edição os vértices das formas são marcados com bolinhas, e basta arrastá-los como desejar.
    3.3 Raios: Para modificar a origem de um raio, deve-se arrastar sua fonte, clicando na parte redonda; já a alteração de seu sentido consiste em arrastar a ponta da sua seta.
    
  4 Modo Debug: Pode ser ativado ou desativado; Revela as coordenadas de todos os pontos de interesse e desativa o comportamento ondulatório dos raios.
  
  5 Salvar sua Arte: Tira uma foto do estado atual do canvas, pra você guardar a sua criação.
```
