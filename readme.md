# E-Voting System

## 一句話描述這個專題
一個具備驗證性與一點點匿名性的線上投票系統  
This is the [deployed link](https://e-voting-web-final.herokuapp.com).

## Usage
### Setup
Run the following command to setup the project:  

```
$ npm install   
$ npm run setup  
```  

### Run the project

```
$ npm start
```

這個專案的前端使用`localhost:3000`，後端使用`localhost:4000`。

## 系統說明與特色
如題所示，這是個投票系統。  
右上角可以進入自己的頁面與Login/Register或是登出。  
在主畫面底下有三個按鈕，分別是Elections、Create、Users，可以在這三個頁面中投票、建立投票與瀏覽使用者資訊。

### 投票系統
我們實作了兩個投票系統  

1. 一般的投票（類似FB民調）
    這種選舉會在使用者投出一張選票號立即更新投票結果，跟一般網路上常見的投票方式一樣，雖然方便但不具有匿名性與驗證性
2. 兩階段選舉(Two-Stage Election)
    此種選舉有**投票**跟**開票**兩個階段，在投票時使用者需要投出選票的雜湊值(Commitment)，此時只有使用者自己知道他投出的選項，後端無法得知選票內容。在第二階段時，使用者必須提交當初的選票內容作為開票證明(Opening)，為了確保匿名性，這個時候會強制使用者登出。

選票設計如下：

```
Choice: Int -> 代表這張選票投出的選項
Secret: Data -> 產生Commitment所需的密碼
Commitment: Hash( Hash(Secret) || Hash(Choice) ) -> 實際投出的選票
Opening: ( Hash(Secret), Choice ) -> 開票證明
```

方便起見，在此使用的Hash Function為SHA3-512，它可以被任何一種安全的雜湊函數代替。

在Commitment的數值確定之後，如果一個使用者反悔將Choice的數值改變，則他必須找到另外一個Secret使這兩張選票的Commitment相同，這也代表他必須找出SHA3-512的碰撞，以目前的技術而言是不可能的事情，而這也代表著Server無法操控選舉結果。

使用者投出Commitment後，Server會立即將選票公布出來，讓選民驗證自己的選票有被正確儲存。在開票時，Server會公布已開出的選票的Opening，讓使用者驗證自己的選票有被正確計算在選舉結果中，同時驗證別張選票的開票結果。

#### 為何只有一點點匿名性？

在投下Commitment時為了確保選民身份，還是會要求需登入才能投票，這時Server可以紀錄下Commitment與身份的對應關係，因此會破壞匿名性。未來可以加入Mix network等系統減弱選票與身份之間的關聯性，加強匿名性。

### Voting Page
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
- chart.js: 顯示出結果的甜甜圈(?)圖（Doughnut Chart）。

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

### Setup
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
