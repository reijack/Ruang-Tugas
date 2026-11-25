/* Pose keys and action order from the supplied scene. */
const RuangMascotScenes = {
  lila: {
    frames: ["kagum","memohon","mengantuk","khawatir","menyerah","mengejek"],
    scenes: [
      {"name":"Tepi Danau","pose":"kagum","actions":["w40","R","p500","w62","L","p400"]},
      {"name":"Siapa di Sana?","pose":"khawatir","actions":["L","p600","R","p600","L","p400"]},
      {"name":"Tolong, Ya?","pose":"memohon","actions":["w35","F","p1300"]},
      {"name":"Capek Sekali","pose":"menyerah","actions":["w18","L","p500","F","p900"]},
      {"name":"Zzz…","pose":"mengantuk","actions":["w45","p600","w72","p600"]},
      {"name":"Dasar Usil","pose":"mengejek","actions":["R","p500","L","p500","R","p600"]}
    ]
  },
  rimba: {
    frames: ["senang","marah","sedih","terkejut","fokus","malu","tertawa","menangis","khawatir","bangga","mengajar","mengantuk"],
    scenes: [
      {"name":"Pagi di Hutan","pose":"senang","actions":["w40","R","p400","w65","L"]},
      {"name":"Suara Apa Itu?","pose":"senang","actions":["w50","R","e:terkejut","p500","L","p600"]},
      {"name":"Baca Catatan","pose":"fokus","actions":["w30","p900","F","p700"]},
      {"name":"Dipuji Murid","pose":"malu","actions":["w55","F","p1200"]},
      {"name":"Jalan Kembali","pose":"khawatir","actions":["L","p500","w25","R","p500","L","p300"]},
      {"name":"Jebakan Pemburu!","pose":"marah","actions":["w60","R","p500","F","p800"]},
      {"name":"Sedih","pose":"sedih","actions":["w45","p900","L","p700"]},
      {"name":"Tak Tertahan","pose":"menangis","actions":["w30","p1300"]},
      {"name":"Lucu Sekali","pose":"tertawa","actions":["w60","R","p500","L","p500"]},
      {"name":"Misi Selesai","pose":"bangga","actions":["w40","F","p1100","w70"]},
      {"name":"Waktunya Mengajar","pose":"mengajar","actions":["w50","R","p600","L","p600","F","p500"]},
      {"name":"Senja","pose":"mengantuk","actions":["w30","p700","w15","p700"]}
    ]
  },
  ambar: {
    frames: ["senang","marah","sedih","terkejut","fokus","malu"],
    scenes: [
      {"name":"Studio Alkimia","pose":"senang","actions":["w40","R","p400","w68","L","p300"]},
      {"name":"Hasil Gagal","pose":"marah","actions":["w50","p500","R","p500","L","p500"]},
      {"name":"Sepi","pose":"sedih","actions":["w30","L","p700","F","p700"]},
      {"name":"Kejutan!","pose":"senang","actions":["w55","R","e:terkejut","p600","L","p500"]},
      {"name":"Menghitung","pose":"fokus","actions":["w25","p800","F","p900","w45"]},
      {"name":"Dipuji Tamu","pose":"malu","actions":["w65","R","p600","F","p900"]}
    ]
  },
};
