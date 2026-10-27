'use strict';
const common=[['title','Title','text',true],['subtitle','Subtitle / role'],['description','Description','textarea'],['image','Image','image'],['url','Button / destination link','link'],['buttonText','Button text'],['status','Visibility','status'],['order','Sort order','number']];
const groups={
 learning:['Learning Support','/#home-learning','LEARNING AT LOGIC','A clear path from learning to progress.','Explore the support around your professional qualification.'],
 faculty:['Faculty Profiles','/#home-faculty','LEARN FROM OUR PEOPLE','Meet your mentors.','Get to know the faculty guiding your learning journey.'],
 'class-previews':['Class Previews','/#home-class-previews','EXPERIENCE THE CLASSROOM','Explore learning at Logic.','Browse class previews and recorded learning options for your course.'],
 resources:['Student Resources','/#home-resources','YOUR LEARNING TOOLKIT','Everything for your next step.','Find schedules, learning options and guidance in one place.'],
 partners:['Hiring Partners','/placements#hiring-partners','HIRING PARTNERS','Where Logic talent meets opportunity.','Explore companies featured in Logic’s hiring-partner network.'],
 affiliations:['Affiliations & Collaborations','/about#affiliations','OUR NETWORK','Learning through strong connections.','Explore the affiliations and collaborations featured by Logic.'],
 life:['Life @ Logic','/life-at-logic','BEYOND THE CLASSROOM','A campus full of possibilities.','Clubs, celebrations and shared experiences that bring the Logic community together.'],
 skills:['Skill Development','/placements#skill-development','CAREER READINESS','Build the skills beyond your qualification.','Explore opportunities to strengthen communication, confidence, teamwork and professional readiness.'],
 wellness:['Health & Wellness','/life-at-logic#health-wellness','STUDENT SUPPORT','Supporting the Logic community.','Find wellness information and the healthcare-support brochure shared by Logic.'],
 asap:['Logic & ASAP','/about#asap','ACADEMIC COLLABORATION','Logic and ASAP Kerala.','Explore the programme pathways featured in Logic’s collaboration with ASAP Kerala.'],
 updates:['Awards & Recognition','/about#awards','MILESTONES','Moments that mark our journey.','Awards, recognitions and updates from the Logic community.'],
 team:['Meet the Team','/meet-the-team','OUR PEOPLE','The people behind your progress.','Connect with Logic for academic guidance and support.'],
 careers:['Join Our Team','/careers','CAREERS AT LOGIC','Help shape the next generation.','Explore opportunities to contribute to professional commerce education at Logic.'],
 recruit:['Recruit Our Talent','/recruit-our-talent','TALENT HUNTER','Find talent for your next opportunity.','Connect with Logic’s placement team to discuss your accounting and finance recruitment needs.'],
 'ca-foundation':['CA Foundation','/courses/ca-foundation','CHARTERED ACCOUNTANCY','Start your CA journey.','Build your grounding in accounting, business law, quantitative skills and economics.'],
 'ca-inter':['CA Intermediate','/courses/ca-inter','CHARTERED ACCOUNTANCY','Build depth. Move forward.','Develop your knowledge across accounting, law, taxation, costing, audit and financial management.'],
 'ca-final':['CA Final','/courses/ca-final','CHARTERED ACCOUNTANCY','Prepare for the next professional step.','Bring together technical knowledge and judgement across advanced areas of the CA pathway.'],
 batches:['Batch Schedule','/batches','UPCOMING BATCHES','Find your next batch.','Filter by branch, course and year. Contact admissions to confirm the current intake and availability.'],
 testimonials:['Student Testimonials','/testimonials','STUDENT STORIES','Real journeys. Real voices.','Hear learning experiences and career stories from the Logic community.']
};
const schemas=Object.fromEntries(Object.entries(groups).map(([key,[label,path,eyebrow,title,intro]])=>[key,{label,path,fields:common,defaults:{eyebrow,title,intro,body:'',buttonText:'Talk to Logic',url:'/contact',emptyText:key==='team'?'Contact our team for faculty and academic guidance.':key==='careers'?'Contact our team to enquire about current opportunities.':'More information will be shared here soon.'}}]));
schemas.batches.fields=[['title','Course / batch name','text',true],['branch','Branch','text',true],['startDate','Start date (optional)','date'],['schedule','Batch / date display text','text',true],['year','Year','year',true],['time','Class timing'],['mode','Learning mode','mode',true],['url','Enquiry link (optional)','link'],['status','Visibility','status'],['order','Sort order','number']];
schemas.testimonials.fields=[['title','Story title','text',true],['subtitle','Student / course'],['description','Short introduction','textarea'],['image','Cover image / thumbnail','image',true],['url','Video link','web',true],['featured','Show on homepage','featured'],['status','Visibility','status'],['order','Sort order','number']];
for(const key of ['partners','affiliations'])schemas[key].fields=[['title','Organisation name','text',true],['image','Logo','image',true],['url','Website link (optional)','web'],['featured','Show on homepage','featured'],['status','Visibility','status'],['order','Sort order','number']];
schemas.careers.fields=[['title','Position title','text',true],['subtitle','Location / employment type'],['description','Role description','textarea',true],['url','Application link (optional)','link'],['buttonText','Application button text'],['status','Visibility','status'],['order','Sort order','number']];
schemas.faculty.fields=[['title','Faculty name','text',true],['subtitle','Subject / qualification'],['description','Profile introduction','textarea'],['image','Faculty photo','image',true],['url','Profile link (optional)','link'],['buttonText','Link text'],['status','Visibility','status'],['order','Sort order','number']];
schemas['class-previews'].fields=[['title','Class title','text',true],['subtitle','Course / faculty'],['description','Class introduction','textarea'],['image','Cover image / thumbnail','image',true],['url','Video / demo link','web',true],['buttonText','Button text'],['status','Visibility','status'],['order','Sort order','number']];
for(const key of ['learning','faculty'])Object.assign(schemas[key].defaults,{url:key==='faculty'?'/contact':'/courses',buttonText:key==='faculty'?'Talk to Logic':'Explore courses'});
Object.assign(schemas['class-previews'].defaults,{url:'/recorded-classes',buttonText:'All recorded classes'});
Object.assign(schemas.resources.defaults,{url:'/contact',buttonText:'Need guidance?'});
module.exports=schemas;
