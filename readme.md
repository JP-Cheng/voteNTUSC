心得
影片 - 架構 - deploy



# An Online Voting System

## 一句話描述這個專題
一個具備驗證性與一點點匿名性的線上投票系統  
This is the [deployed link](https://e-voting-web-final.herokuapp.com).


## 動機
是這樣的，因為我在學代會裡面也有一段時間（雖然這學期不是學代），每次投票的時候都會一片混亂，而且大家會為了串連而不在固定位置。雖然這個專題只是當初不知道期中專題要做什麼的產物啦，但主要還是希望能讓學代跟秘書們能夠不用走動，在自己的手機上就可以投票，所以在設計UI的時候納入了很多行動裝置的考慮。本來的設計是有管理者權限（正副議長、秘書長、root帳號）可以launch a vote，但是因為還沒跟資料庫串連（跟DB不熟嗚嗚），也還沒有教cookie/session怎麼實作，所以這個部分還沒完成，希望留待期末專題。


## usage
### setup
Run the following command to setup the project:  

```
$ npm install   
$ npm run setup  
```  

### run the project

```
$ npm start
```

這個專案的前端使用`localhost:3000`，後端使用`localhost:4000`。

## 系統說明
如題所示，這是個投票系統。  
右上角可以進入自己的頁面與sign in/up或是登出。  
在主畫面底下有四個按鈕，分別是Elections、Create、users。  
所有的頁面都是直觀的使用就可以。

### feature
除了一般的投票（like FB民調）之外，我們設計了一個two-stage election，可以設定自己的密碼。投票的過程會產生：

1. SHA3-512(the voted ballot)
2. SHA3-512(password)
3. SHA3-512(the concation of the result of 1, 2)  

在投完票之後，進到驗票的畫面，有個hash test，可以輸入自己的密碼得到雜湊值，並比較自己所投的票，就知道有沒有被竄改。

### the voting page
建立投票的人可以直接在voting page開票或刪除，也可以在使用者頁面進行。

## 使用與參考之框架/模組/原始碼

### 前端
- React: 我們的前端是以React開發
- Apollo、graphql: 由於後端有使用到GraphQL，因此在Client的部分有使用到Apollo跟graphql
- Reactstrap: 我們使用Reactstrap的元件加速前端的開發
- jsSHA: 在兩階段投票時使用jsSHA在Client端計算雜湊值

### 後端
- graphql-yoga: 作為後端Server以及與前端的API接口使用
- bcrypt: 用來計算使用者密碼的雜湊值
- JsonWebToken: 加密Session資訊，讓Server端不需要保留Session的內容
- jsSHA: 開票時用來計算開票內容的雜湊值
- mongoose: 連接MongoDB資料庫
- babel: 用來轉換ES6的Javascript
- nodemon: 方便後端開發
- mocha: 作為後端測試框架
- chai: 用來做測試驗證
- graphql-request: 後端測試時使用的GraphQL Client

### setup
- concurrently：可以直接使`npm run <some script>`或是`npm start`來同時操作前後端。

## 未來展望
考慮到使用者體驗，希望能將表決結果圖像化，目前考慮串接的是`chart.js`，不過還沒有弄好。

## 每位組員之貢獻
鄭景平主要負責前端、UI。  
王秉倫主要負責後端與部分前端。  
詳情可以參見[github commits page](https://github.com/JP-Cheng/voteNTUSC/commits/master)。

## 心得

## 課程建議
1. 

