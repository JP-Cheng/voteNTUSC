心得
影片 - 架構 - deploy



# An Online Voting System

## 一句話描述這個專題
一個具備驗證性與一點點匿名性的線上投票系統  
This is the [deployed link](https://e-voting-web-final.herokuapp.com).

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

### hash
除了一般的投票（like FB民調）之外，我們設計了一個two-stage election，可以設定自己的密碼。投票的過程會產生：  

1. SHA3-512(the voted ballot)  
2. SHA3-512(password)  
3. SHA3-512(the concation of the result of 1, 2)  

在投完票之後，進到驗票的畫面，有個hash test，可以輸入自己的密碼得到雜湊值，並比較自己所投的票，就知道有沒有被竄改。  

### the voting page
建立投票的人可以直接在voting page開票或刪除，也可以在使用者頁面進行。  

### [chart.js](https://github.com/jerairrest/react-chartjs-2)
如果某個議題已經在開票狀態而且總票數不為零，就會顯示出result doughnut chart，最多支援到10個選項（含廢票，超過的話會顯示同一種顏色）。  
![example chart](https://imgur.com/0NcjcjP.png)

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

## 每位組員之貢獻
鄭景平主要負責前端、UI。  
王秉倫主要負責後端與部分前端。  
詳情可以參見[github commits page](https://github.com/JP-Cheng/voteNTUSC/commits/master)。

## 心得

## 課程建議
1. 其實這應該是個可以開設兩學期的課程，要把內容塞在一個學期已經很趕了，希望比較重要的東西可以多給一些課外資源。像是array function, map function, React Props/State等等，這些之後會一再重複用到的東西，如果沒有跟上的話，後面幾週根本就不知道在幹嘛。  
2. 關於資料庫的部分其實講得頗少，主要還是focus在前後端的操作，但是如果不串接資料庫的話，在後續的應用幾乎做不出什麼東西，希望這部分可以多講一點。  
3. 後端的部分講了很多技術跟架構，但其實不可能每個都學會，所以還是希望可以向前端一樣，集中某樣東西多講一點。  
4. 感覺HW/Practice大部分集中在前幾週（只有HW3在後半學期...），而且也集中在前端的架構，希望可以分散一部分到後面幾週（不過後半學期每堂課都在交作業，還是可以不用分太多，不然大家會死掉吧XD），才不會前半學期累得要死，後半學期也沒什麼練習到。  

