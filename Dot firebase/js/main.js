'use strict';

  const firebaseConfig = {
    apiKey: "AIzaSyBMvOgxZ4im_lZELG9GLmjN-QiKAS40w-A",
    authDomain: "mychatapp-ff7f3.firebaseapp.com",
    databaseURL: "https://mychatapp-ff7f3.firebaseio.com",
    projectId: "mychatapp-ff7f3",
    storageBucket: "mychatapp-ff7f3.appspot.com",
    messagingSenderId: "250063870264",
    appId: "1:250063870264:web:f2c2e90fceebb42f1ac9cd"
  };

  firebase.initializeApp(firebaseConfig);
  //Cloud Firestore のインスタンスを初期化します。
  const db = firebase.firestore();

  // db.settings({
  //   timestampsInSnapshots: true
  // });
  const collection = db.collection('messages');

  const auth = firebase.auth();//auth instance
  let me = null;
  
  const message = document.getElementById('message');//textのid
  const form = document.querySelector('form');
  const messages = document.getElementById('messages');//ulのid,データ表示用
  const login = document.getElementById('login');
  const logout = document.getElementById('logout');
  //複数のドキュメントの取得
 
  // login処理
  login.addEventListener('click',() =>{
    auth.signInAnonymously();//匿名でのユーザーのログインを行います。
  });

   //logout処理
   logout.addEventListener('click',() =>{
    auth.signOut();//登出
  });

  auth.onAuthStateChanged(user =>{//現在ログインしているユーザーを取得するには、Auth オブジェクトでオブザーバー(堅聽者)を設定する
    if(user){// User is signed in.
      me = user;

      while(messages.firstChild){
        messages.removeChild(messages.firstChild);
      }

      collection.orderBy('created').onSnapshot(snapshot =>{//若是要追蹤一個集合中的多個文件，可以透過 query 相關方法去篩選文件，最後用 onSnapshot() 取代原本要獲取資料的 get()
        snapshot.docChanges().forEach(change =>{
          if(change.type === 'added'){//QuerySnapshot 有提供一個名為 docChanges() 的方法用來追蹤文件變動，它會回傳由 DocumentChange 物件組成的陣列，我們可以透過其中的 type 屬性來暸解變動的類別是新增、更新、還是移除，透過這些資訊我們就可以針對不同的變動類型做出不同的對應方式。若是 onSnapshot() 方法是第一次執行，那麼變動的類型都會是 added。
            const li = document.createElement('li');
            // li.textContent = change.doc.data().message;
            const d = change.doc.data();//データをdで受け取る処理
            li.textContent = d.uid.substr(0, 8)+':'+ d.message;
            messages.appendChild(li);
          }
        });
      }, error => {});
      console.log(`Logged in as: ${user.uid}`);
      login.classList.add('hidden');
      [logout, form, messages].forEach(el =>{
        el.classList.remove('hidden');
      });
      message.focus();//Login後focus在text
      return;
    }
    me = null;
    console.log('Nobody is logged in');
    login.classList.remove('hidden');
    // form.classList.remove('hidden');
    [logout, form, messages].forEach(el =>{
      el.classList.add('hidden');
    });
  });
  
  form.addEventListener('submit', e => {
    e.preventDefault();

    const val = message.value.trim();//trimで前後の空白スペースを削除する方法
    if(val === ""){
      return;//如果輸入的是空白，return,後面的都不處理，
    }

    //投稿直後表示する
    // const li = document.createElement('li');
    //   li.textContent = val;
    //   messages.appendChild(li);

      message.value = '';
      message.focus();
    //データを追加する、Cloud Firestore はデータをドキュメントに保存します。ドキュメントはコレクションに保存されます。新しいコレクションとドキュメントを作成します。
    collection.add({
      message: val,
      created:firebase.firestore.FieldValue.serverTimestamp(),
      uid: me ?me.uid : 'nobody'//if uid:me === true執行me.id，if uid:me === false，執行nobody
    })
    .then(doc => {
      console.log(`${doc.id} added!`);
    })
    .catch(error => {
      console.log('document add error');
      console.log(error);
    });
  });

  
 