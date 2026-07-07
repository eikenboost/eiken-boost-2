insert into public.content_vocab (id, word, meaning_ja, choices, answer, explanation_ja, tag)
values
  ('v1', 'available', '利用できる', '["危険な","利用できる","混雑した","役に立たない"]', '利用できる', 'available は「使える・空いている」の意味。', '日常表現'),
  ('v2', 'environment', '環境', '["環境","意見","経験","産業"]', '環境', 'environment は自然・学習・職場など広く使える単語。', '社会'),
  ('v3', 'improve', '改善する', '["繰り返す","改善する","許可する","約束する"]', '改善する', 'improve your English の形が頻出。', '学習')
on conflict (id) do nothing;

insert into public.content_reading (id, title, topic, difficulty, passage, questions)
values (
  'r1',
  '学校図書館の新しい使い方',
  'school',
  '標準',
  'A high school library in Osaka changed its layout last year. Instead of keeping all desks in one area, the school created small study zones for different purposes. Some students now use the library before club activities, while others stay after school to prepare for tests. According to the librarian, the number of visitors has increased because students can choose a space that matches their needs.',
  '[{"id":"r1q1","question":"Why has the number of visitors increased?","choices":["The library is open all night.","Students can choose a suitable space.","Club activities were moved there.","The library now offers free food."],"answer":"Students can choose a suitable space.","explanation":"needs に合う場所を選べるからです。"}]'::jsonb
)
on conflict (id) do nothing;

insert into public.content_prompts (id, kind, prompt_text, helper_text, extra)
values
  ('w1', 'writing', 'Do you think high school students should have a part-time job? Write about 80-100 words.', '理由を2つに分けると整理しやすいです。', '{}'::jsonb),
  ('w2', 'writing', 'Do you agree that people should study English from elementary school? Write about 80-100 words.', '最初の1文で立場を明確に。', '{}'::jsonb),
  ('s1', 'speaking', 'Please describe one good habit for staying healthy.', '結論→理由→例の順がおすすめです。', '{"followUps":["Why is it useful?","How can students start this habit?"]}'::jsonb),
  ('s2', 'speaking', 'Do you think people should read news every day?', 'Yes / No のあとに理由を続けましょう。', '{"followUps":["Why or why not?","What kind of news is important for students?"]}'::jsonb)
on conflict (id) do nothing;
