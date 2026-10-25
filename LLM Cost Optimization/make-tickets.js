// make-tickets.js  -- one-off generator for data/tickets.json
// Fifty support tickets written against data/policy.md (Harborline handbook).
//
// complexity: 'simple'   -> one clear lookup, a single section answers it       -> Haiku 4.5
//             'judgment' -> weighs sections, edge case, or handbook is silent   -> Sonnet 5
// priority:   'urgent'   -> live chat or phone, customer is waiting             -> synchronous
//             'backlog'  -> overnight email queue, answered next morning        -> batched
import fs from 'node:fs';

const S = 'simple', J = 'judgment', U = 'urgent', B = 'backlog';
const t = [];
const add = (complexity, priority, channel, text) =>
  t.push({ id: `T-${String(t.length + 1).padStart(3, '0')}`, complexity, priority, channel, text: text.trim() });

// ---------- URGENT + SIMPLE (11) : live chat and phone, single-section lookups ----------
add(S, U, 'chat', 'How long do I have to report a damaged item after delivery?');
add(S, U, 'phone', 'What time is the cutoff if I want to skip next week?');
add(S, U, 'chat', 'How many weeks can I pause my subscription for?');
add(S, U, 'chat', 'Do I need to send a photo to claim for a missing item worth about eight pounds?');
add(S, U, 'phone', 'Is there a minimum order value on the Market plan?');
add(S, U, 'chat', 'How long does a refund take to reach my card?');
add(S, U, 'chat', 'Can I use two promo codes on the same order?');
add(S, U, 'phone', 'Nobody was home and the box went back to the depot. Will you redeliver it?');
add(S, U, 'chat', 'How many free skips do I get in a year?');
add(S, U, 'chat', 'My delivery was three hours outside the window. What am I entitled to?');
add(S, U, 'phone', 'Can my partner change the card on the account, or does it have to be me?');

// ---------- URGENT + JUDGMENT (7) : live, needs weighing ----------
add(J, U, 'phone', 'I cancelled at 11:40 and the cutoff is midday, but I have still been charged. My confirmation email says 13:20. Which time counts?');
add(J, U, 'chat', 'Half the box arrived unusable and the rest is pointless without it. I want the whole order refunded and I am not sending anything back.');
add(J, U, 'phone', 'We run a small cafe and use the boxes for the kitchen, but the account is in my own name. Do the consumer rules still apply to my claim?');
add(J, U, 'chat', 'My son has a nut allergy recorded on the account and this week we were sent a substitute containing nuts. He has not eaten it. What happens now?');
add(J, U, 'phone', 'Two of your agents told me different things about how long I can pause for. One said twelve weeks, one said as long as I want. I made a decision based on the second answer.');
add(J, U, 'chat', 'I placed the order while your promotion page was still up, but the code was rejected as expired. The email you sent me quoted a later date than the code allowed.');
add(J, U, 'phone', 'This is my third late delivery. I want written confirmation from you that it will not happen again before I continue the subscription.');

// ---------- BACKLOG + SIMPLE (21) : overnight email, single-section lookups ----------
add(S, B, 'email', 'What are your support hours at the weekend?');
add(S, B, 'email', 'How do I add a second person to manage my deliveries?');
add(S, B, 'email', 'Do you deliver on public holidays?');
add(S, B, 'email', 'Which payment methods do you accept? Can I pay by bank transfer?');
add(S, B, 'email', 'How long do you keep my order history for?');
add(S, B, 'email', 'Is the insulated liner recyclable at home with the rest of the packaging?');
add(S, B, 'email', 'When do I get the credit for referring a friend?');
add(S, B, 'email', 'How many deliveries do I need before loyalty pricing kicks in?');
add(S, B, 'email', 'If I change from Flex to Essentials today, when does it take effect?');
add(S, B, 'email', 'Can I set a substitution rule for one specific product rather than a whole category?');
add(S, B, 'email', 'What happens to my subscription if my card payment fails?');
add(S, B, 'email', 'How much notice do you give before a price increase?');
add(S, B, 'email', 'Can I get a VAT invoice for my orders?');
add(S, B, 'email', 'Do you offer a timed delivery slot rather than a four hour window?');
add(S, B, 'email', 'I want to close my account permanently. What happens to the credit sitting on it?');
add(S, B, 'email', 'Can I leave delivery instructions asking the driver to ring the doorbell and wait?');
add(S, B, 'email', 'I received a gift subscription. Can I change the payment method on it?');
add(S, B, 'email', 'Do prices on the website include VAT?');
add(S, B, 'email', 'How do I verify my identity if I have lost access to my registered email?');
add(S, B, 'email', 'Can I move my remaining credit to my daughter\u2019s separate account?');
add(S, B, 'email', 'My delivery address is changing to a postcode I am not sure you cover. What happens?');

// ---------- BACKLOG + JUDGMENT (11) : overnight email, needs weighing ----------
add(J, B, 'email', 'I reported spoiled items sixty two hours after delivery. That is past your window, but I was away and there was no bank holiday. Where does that leave me?');
add(J, B, 'email', 'I have had one item missing on each of the last three deliveries. Individually each is small, together it is not. How is this being handled?');
add(J, B, 'email', 'I raised a claim on Friday evening. Your terms say forty eight hours for claims but also five working days for resolution. Which one applies to me?');
add(J, B, 'email', 'You granted me an exception on a late claim last quarter. I assume the same applies this time?');
add(J, B, 'email', 'I am quoting the terms I downloaded last year, which gave a longer claim window. I deliberately waited because of that. Which version applies to an order I placed this week?');
add(J, B, 'email', 'My complaint covers a wrong charge, a missed delivery and two spoiled items. I want one single resolution for all of it, not three separate answers.');
add(J, B, 'email', 'I cancelled by mistake and reactivated the same day, but my promotional price is gone. Surely that can be put back given it was minutes apart?');
add(J, B, 'email', 'We are a registered business and want an indemnity clause and a service level commitment added to our terms before we expand the order.');
add(J, B, 'email', 'My request does not seem to fit any of the categories on your help pages, but it is reasonable. What is the process and what happens in the meantime?');
add(J, B, 'email', 'I referred my flatmate at the same address and the credit was reversed. We are two separate paying customers, so why does that not count?');
add(J, B, 'email', 'A delivery failed for the second time this year. Your driver logged an attempt at a time I was demonstrably at home, and I have the door camera footage.');

fs.writeFileSync('data/tickets.json', JSON.stringify(t, null, 2));

const n = (f, v) => t.filter(x => x[f] === v).length;
const cross = (c, p) => t.filter(x => x.complexity === c && x.priority === p).length;
console.log(`total ${t.length}`);
console.log(`simple ${n('complexity', S)}  judgment ${n('complexity', J)}`);
console.log(`urgent ${n('priority', U)}  backlog ${n('priority', B)}`);
console.log(`batch slice: ${cross(S, B)} Haiku + ${cross(J, B)} Sonnet`);
console.log(`unique ids: ${new Set(t.map(x => x.id)).size}`);
